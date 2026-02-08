# ML Email Classification

This directory contains the machine learning pipeline for job email classification.

## Setup

### 1. Install Python Dependencies

```bash
pip install torch transformers datasets scikit-learn pandas
```

### 2. Generate Training Data

```bash
python generate_training_data.py
```

This creates `job_emails_dataset.csv` with 1200+ labeled emails.

### 3. Train the Model

```bash
python train_classifier.py
```

Training takes ~30-60 minutes on CPU, ~5-10 minutes on GPU.

### 4. Export to ONNX (for Node.js)

```bash
python train_classifier.py export
```

Creates `job_classifier.onnx` (~100MB).

### 5. Test the Model

```bash
python train_classifier.py test
```

## Files

| File | Description |
|------|-------------|
| `generate_training_data.py` | Synthetic email generator |
| `train_classifier.py` | Model training & export |
| `job_emails_dataset.csv` | Generated training data |
| `model_output/` | Trained PyTorch model |
| `job_classifier.onnx` | Exported ONNX model |

## Categories

- **0 - applied**: Job application confirmations
- **1 - interview**: Interview invitations
- **2 - rejection**: Rejection notices
- **3 - not_job**: Non-job emails (spam, newsletters, etc.)
