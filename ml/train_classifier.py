"""
DistilBERT Fine-Tuning Script for Job Email Classification
Trains a 4-class classifier on synthetic email data
"""

import os
import torch
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from datasets import load_dataset, DatasetDict
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np

# ============================================
# CONFIGURATION
# ============================================

MODEL_NAME = "distilbert-base-uncased"
NUM_LABELS = 4  # applied, interview, rejection, not_job
MAX_LENGTH = 256  # Max tokens per email
BATCH_SIZE = 8
NUM_EPOCHS = 3
LEARNING_RATE = 2e-5
OUTPUT_DIR = "./model_output"
DATASET_PATH = "./job_emails_dataset.csv"

# Labels
LABEL_NAMES = ["applied", "interview", "rejection", "not_job"]

# ============================================
# LOAD AND PREPARE DATA
# ============================================

def load_data():
    """Load dataset from CSV"""
    print(f"Loading dataset from {DATASET_PATH}...")
    dataset = load_dataset('csv', data_files=DATASET_PATH)
    
    # Split into train/test
    dataset = dataset['train'].train_test_split(test_size=0.2, seed=42)
    
    print(f"Train size: {len(dataset['train'])}")
    print(f"Test size: {len(dataset['test'])}")
    
    return dataset

# ============================================
# TOKENIZATION
# ============================================

def tokenize_data(dataset, tokenizer):
    """Tokenize the dataset"""
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            truncation=True,
            padding='max_length',
            max_length=MAX_LENGTH,
        )
    
    print("Tokenizing dataset...")
    tokenized = dataset.map(tokenize_function, batched=True)
    
    # Remove text column and rename label
    tokenized = tokenized.remove_columns(['text', 'category'])
    tokenized = tokenized.rename_column('label', 'labels')
    tokenized.set_format('torch')
    
    return tokenized

# ============================================
# METRICS
# ============================================

def compute_metrics(pred):
    """Compute evaluation metrics"""
    labels = pred.label_ids
    preds = np.argmax(pred.predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='weighted'
    )
    acc = accuracy_score(labels, preds)
    
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall,
    }

# ============================================
# TRAINING
# ============================================

def train_model():
    """Main training function"""
    print("=" * 50)
    print("DistilBERT Email Classifier Training")
    print("=" * 50)
    
    # Check for GPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # Load tokenizer and model
    print(f"Loading {MODEL_NAME}...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_LABELS,
        id2label={i: name for i, name in enumerate(LABEL_NAMES)},
        label2id={name: i for i, name in enumerate(LABEL_NAMES)},
    )
    
    # Load and prepare data
    dataset = load_data()
    tokenized_dataset = tokenize_data(dataset, tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=50,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        report_to="none",  # Disable wandb
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset['train'],
        eval_dataset=tokenized_dataset['test'],
        compute_metrics=compute_metrics,
    )
    
    # Train
    print("\nStarting training...")
    trainer.train()
    
    # Evaluate
    print("\nEvaluating model...")
    results = trainer.evaluate()
    print("\nEvaluation Results:")
    for key, value in results.items():
        print(f"  {key}: {value:.4f}")
    
    # Save model
    print(f"\nSaving model to {OUTPUT_DIR}...")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    print("\nTraining complete!")
    return model, tokenizer

# ============================================
# EXPORT TO ONNX
# ============================================

def export_to_onnx(model_path=OUTPUT_DIR, onnx_path="./job_classifier.onnx"):
    """Export model to ONNX format for Node.js deployment"""
    print(f"\nExporting model to ONNX format: {onnx_path}")
    
    tokenizer = DistilBertTokenizer.from_pretrained(model_path)
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    model.eval()
    
    # Create dummy input
    dummy_text = "Thank you for applying to Software Engineer at Google"
    inputs = tokenizer(
        dummy_text,
        return_tensors="pt",
        truncation=True,
        padding='max_length',
        max_length=MAX_LENGTH,
    )
    
    # Export
    torch.onnx.export(
        model,
        (inputs['input_ids'], inputs['attention_mask']),
        onnx_path,
        input_names=['input_ids', 'attention_mask'],
        output_names=['logits'],
        dynamic_axes={
            'input_ids': {0: 'batch_size'},
            'attention_mask': {0: 'batch_size'},
            'logits': {0: 'batch_size'},
        },
        opset_version=14,
    )
    
    print(f"ONNX model saved to {onnx_path}")
    print(f"Model size: {os.path.getsize(onnx_path) / 1024 / 1024:.2f} MB")

# ============================================
# INFERENCE TEST
# ============================================

def test_inference(model_path=OUTPUT_DIR):
    """Test the trained model"""
    print("\n" + "=" * 50)
    print("Testing Model Inference")
    print("=" * 50)
    
    tokenizer = DistilBertTokenizer.from_pretrained(model_path)
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    model.eval()
    
    test_emails = [
        "Thank you for applying to Software Engineer at Google. We received your application.",
        "We'd like to schedule an interview for the Senior Developer position next week.",
        "After careful consideration, we've decided to move forward with other candidates.",
        "Your Amazon order has shipped! Track your package at amazon.com",
        "50% OFF this weekend only! Shop now at our store.",
    ]
    
    for email in test_emails:
        inputs = tokenizer(
            email,
            return_tensors="pt",
            truncation=True,
            padding='max_length',
            max_length=MAX_LENGTH,
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred].item()
        
        print(f"\nEmail: {email[:60]}...")
        print(f"Prediction: {LABEL_NAMES[pred]} (confidence: {confidence:.2%})")

# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "export":
        export_to_onnx()
    elif len(sys.argv) > 1 and sys.argv[1] == "test":
        test_inference()
    else:
        # Full training pipeline
        model, tokenizer = train_model()
        test_inference()
        
        # Ask about ONNX export
        response = input("\nExport to ONNX for Node.js? (y/n): ")
        if response.lower() == 'y':
            export_to_onnx()
