# Product Card Template Design

This document outlines the design and behavior of the new Product Card template for the shop page.

## Visual Design Reference
![Reference Design](uploaded_image_0_1765728899100.png)

## Component Specifications

### Layout
- **Container**: Vertical flex layout.
- **Image Area**:
    - Aspect Ratio: Portrait (e.g., 3:4 or custom).
    - Content: Main product image.
    - Overlay (Hover):
        - Background: Clear or slight dim.
        - Elements: 3 Circular Buttons centered horizontally at the bottom of the image area.
- **Info Area**:
    - Padding: Standard (e.g., `p-4`).
    - Alignment: Centered text.

### Typography
- **Product Name**:
    - Font: Sans-serif (clean, modern).
    - Case: Uppercase.
    - Size: Small/Medium (e.g., `text-sm`).
    - Color: Dark Gray / Black.
- **Price**:
    - Current Price: Bold, Maroon Color.
    - Original Price: Strikethrough, Light Gray.
- **Discount Badge**:
    - Text: "XX% OFF".
    - Color: Maroon/Red to match brand.

### Interactions
- **Hover State**:
    - Image scales slightly (zoom effect).
    - Action buttons fade in and slide up slightly.
- **Action Buttons**:
    1.  **View (Eye Icon)**:
        -   Action: Navigates to `/product/[id]`.
        -   Style: White circle, dark icon.
    2.  **Wishlist (Heart Icon)**:
        -   Action: Adds/Removes from Wishlist.
        -   State: Filled icon if active.
        -   Style: White circle, dark icon (Red if active).
    3.  **Add to Cart (Bag Icon)**:
        -   Action: Adds to cart via `CartContext`.
        -   Style: White circle, dark icon.

### Technical Implementation
- **File**: `app/(shop)/shop/components/ShopProductCard.tsx`
- **Context**: `WishlistContext` for state management.
