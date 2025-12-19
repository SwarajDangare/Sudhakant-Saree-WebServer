'use client';

import { usePathname } from 'next/navigation';
import ScrollWrapper from './ScrollWrapper';
import PromoBar from './PromoBar';
import HeaderClient from './HeaderClient';

interface HeaderContainerProps {
  sectionsWithCategories: any[];
}

export default function HeaderContainer({ sectionsWithCategories }: HeaderContainerProps) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  // On homepage, we use 'fixed' so it overlays the hero image
  // On other pages, we use 'sticky' (or relative flow) so it pushes the content down
  // If we use 'sticky', the content naturally starts after it.
  const positionClass = isHomepage ? 'fixed' : 'sticky';

  return (
    <div className={`${positionClass} top-0 left-0 right-0 z-50`}>
      <ScrollWrapper>
        <PromoBar />
        <HeaderClient sectionsWithCategories={sectionsWithCategories} />
      </ScrollWrapper>
    </div>
  );
}
