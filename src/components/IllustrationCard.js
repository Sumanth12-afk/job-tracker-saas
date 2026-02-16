import Image from 'next/image';
import styles from './IllustrationCard.module.css';

/**
 * IllustrationCard — wraps white-background illustrations in a styled card
 * so they look intentional in dark mode.
 *
 * @param {Object} props
 * @param {string}   props.src            - Image path (e.g. "/images/hero_1.png")
 * @param {string}   props.alt            - Alt text for accessibility
 * @param {number}   [props.width=1200]   - Intrinsic image width
 * @param {number}   [props.height=800]   - Intrinsic image height
 * @param {string}   [props.sizes]        - Responsive sizes attribute
 * @param {string}   [props.className]    - Extra classes on outer card
 * @param {string}   [props.innerClassName] - Extra classes on inner wrapper
 * @param {boolean}  [props.priority]     - next/image priority loading
 * @param {boolean}  [props.compact]      - Less padding (for logos strip etc.)
 */
export default function IllustrationCard({
    src,
    alt,
    width = 1200,
    height = 800,
    sizes,
    className = '',
    innerClassName = '',
    priority = false,
    compact = false,
}) {
    const cardClasses = [
        styles.card,
        compact ? styles.compact : '',
        className,
    ].filter(Boolean).join(' ');

    const innerClasses = [
        styles.inner,
        innerClassName,
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses}>
            <div className={innerClasses}>
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes={sizes}
                    className={styles.image}
                    priority={priority}
                />
            </div>
        </div>
    );
}
