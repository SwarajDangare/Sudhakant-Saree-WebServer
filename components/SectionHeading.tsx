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
    <div className={`${alignmentClasses[align]} mb-4 md:mb-6`}>
      {/* Main Title - BIGGER and more prominent */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-maroon mb-2">
        {title}
      </h2>

      {/* Description - Gray text */}
      {description && (
        <p className={`text-gray-600 text-sm md:text-base max-w-2xl mb-2 ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}

      {/* Ornamental Divider BELOW description */}
      <OrnamentalDivider className="my-2" />
    </div>
  );
}
