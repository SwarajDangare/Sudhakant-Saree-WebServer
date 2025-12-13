import OrnamentalDivider from './OrnamentalDivider';

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
}

export default function SectionHeading({
  subtitle,
  title,
  description,
  align = 'center'
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`${alignmentClasses[align]} mb-10 md:mb-12`}>
      {/* Subtitle */}
      {subtitle && (
        <span className="inline-block text-golden text-xs md:text-sm font-semibold tracking-widest uppercase mb-2">
          {subtitle}
        </span>
      )}

      {/* Main Title - Smaller size */}
      <h2 className="text-2xl md:text-3xl font-bold text-maroon mb-3">
        {title}
      </h2>

      {/* Ornamental Divider below title */}
      <OrnamentalDivider />

      {/* Description */}
      {description && (
        <p className={`text-gray-600 text-sm md:text-base max-w-2xl mt-4 ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
}
