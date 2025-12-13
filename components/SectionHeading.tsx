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
    <div className={`${alignmentClasses[align]} mb-12 md:mb-16`}>
      {/* Top Ornamental Divider */}
      <div className={`flex items-center gap-3 mb-4 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-golden"></div>
        <div className="w-2 h-2 rounded-full bg-maroon"></div>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-golden"></div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span className="inline-block text-golden text-sm font-semibold tracking-widest uppercase mb-3">
          {subtitle}
        </span>
      )}

      {/* Main Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-maroon mb-4">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className={`text-gray-600 text-base md:text-lg max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}

      {/* Bottom Ornamental Divider */}
      <div className={`flex items-center gap-3 mt-4 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-golden"></div>
        <div className="w-2 h-2 rounded-full bg-maroon"></div>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-golden"></div>
      </div>
    </div>
  );
}
