# Complete User & Permission Management Guide

## Overview

Your admin panel now features a **comprehensive user and permission management system** that allows Super Admins to:

✅ **Edit team members** - Change names, emails, roles, and passwords
✅ **Delete team members** - Remove users with confirmation
✅ **Manage individual permissions** - Override role permissions for specific users
✅ **Prevent permission requests** - Set permissions once, users never need to ask again
✅ **Fine-grained access control** - Hide sensitive data from specific users

---

## 🚀 **Setup Instructions**

### **Step 1: Run Database Migration**

Manually run this SQL in **Neon's SQL Editor**:

```sql
CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"permissionId" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_users_id_fk"
FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_permissions_id_fk"
FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
```

### **Step 2: Seed Permissions** (if you haven't already)

```bash
npm run db:seed-permissions
```

This creates 23 default permissions across 6 categories.

---

## 📋 **Features**

### **1. Team Members Management**

Each team member card now has:
- **✏️ Edit & Permissions** button - Opens comprehensive edit modal
- **🗑️ Delete** button - Removes user (with protection for super admin)
- **Active/Inactive toggle** - Quick status updates

### **2. User Edit Modal**

When you click "Edit & Permissions", you get a comprehensive modal with two sections:

#### **Section 1: User Details**
- **Name** - Update user's display name
- **Email** - Change email address (with uniqueness validation)
- **Role** - Change between Super Admin, Shop Manager, or Salesman
- **Password** - Reset password (leave blank to keep current)

#### **Section 2: Individual Permissions**
- Checkboxes for ALL permissions
- Organized by category (Dashboard, Products, Orders, etc.)
- Visual indicator showing which permissions are user-specific overrides
- Independent from role permissions

---

## 🎯 **How It Works**

### **Permission Hierarchy**

1. **Role Permissions** (Default) - Applied to all users of a role
2. **User Permissions** (Override) - Applied to specific users only

**Example:**
- **Role:** Salesman has only "View Dashboard" and "View Products"
- **User Override:** You grant specific salesman "View Orders" and "View Financials"
- **Result:** That salesman has 4 permissions total (role + overrides)

### **User Override Badge**

When a permission is granted specifically to a user (not from their role), you'll see:
```
✓ View Financials
  [User Override]
```

This helps you track which permissions are customized.

---

## 💼 **Common Use Cases**

### **Use Case 1: Experienced Salesman Needs More Access**

**Scenario:** You have a trusted salesman who should manage orders.

**Steps:**
1. Click "Edit & Permissions" on their user card
2. Scroll to "Orders" category
3. Enable "View All Orders" and "Update Order Status"
4. Click "Save Permissions"

**Result:** This salesman can now manage orders, but other salesmen cannot.

---

### **Use Case 2: Hide Financial Data from Shop Manager**

**Scenario:** You have a shop manager who shouldn't see revenue reports.

**Steps:**
1. Click "Edit & Permissions" on their user card
2. Scroll to "Dashboard" category
3. Disable "View Financials"
4. Click "Save Permissions"

**Result:** This shop manager can't access financial reports, even though their role normally allows it.

---

### **Use Case 3: Temporary Access for Specific Task**

**Scenario:** A salesman needs to create categories for one week.

**Steps:**
1. Grant "Manage Categories" permission to that user
2. After one week, edit the user again and remove the permission

**Result:** Temporary access without changing their role or affecting other salesmen.

---

### **Use Case 4: Prevent Specific User from Deleting Products**

**Scenario:** A shop manager should edit products but not delete them.

**Steps:**
1. Edit the shop manager
2. Disable "Delete Products" permission
3. Keep "View Products", "Create Products", and "Edit Products" enabled

**Result:** They can manage products but can't delete them.

---

## 🛡️ **Security Features**

### **Protected Super Admin**
- Cannot delete the primary super admin account
- Cannot deactivate the primary super admin
- Cannot change the primary super admin's role

### **Email Validation**
- Email uniqueness enforced
- Cannot change to an email already in use

### **Role Restrictions**
- Only one super admin allowed
- Cannot change super admin's role
- Prevents accidental permission escalation

### **Cascade Deletion**
- When a user is deleted, their custom permissions are automatically removed
- Maintains database integrity

---

## 📊 **Permission Categories**

### **Dashboard**
- `view_dashboard` - Access main dashboard
- `view_financials` - View revenue and financial reports

### **Products**
- `view_products` - View product catalog
- `create_products` - Add new products
- `edit_products` - Modify existing products
- `delete_products` - Remove products

### **Orders**
- `view_orders` - View basic orders
- `view_all_orders` - View all orders (including completed/cancelled)
- `update_orders` - Change order status
- `delete_orders` - Remove orders

### **Catalog**
- `view_categories` - View categories
- `manage_categories` - Create/edit categories
- `view_sections` - View sections
- `manage_sections` - Create/edit sections

### **Customers**
- `view_customers` - Access customer data
- `edit_customers` - Modify customer info
- `delete_customers` - Remove customer accounts

### **System**
- `view_users` - View admin user list
- `manage_users` - Create/edit/delete admin users
- `manage_permissions` - Modify permission system
- `system_settings` - Access system configuration

---

## 🔄 **Workflows**

### **Weekly Team Review Workflow**

1. **Monday:** Review team members and their current permissions
2. **Identify needs:** Which users need additional access?
3. **Grant temporary permissions:** Give access for specific tasks
4. **Friday:** Remove temporary permissions
5. **Document:** Keep notes on why permissions were granted

### **Onboarding New Team Member**

1. **Create user** with appropriate role (Salesman, Shop Manager)
2. **Test access** - Have them log in and verify base permissions work
3. **Grant additional access** if needed for their specific responsibilities
4. **Review after 1 week** - Adjust permissions based on actual needs

### **Offboarding Team Member**

1. **Deactivate user** (toggle to inactive) - Prevents login immediately
2. **Review their work** - Check if any orders/products need reassignment
3. **Delete user** when ready - Permanently removes from system

---

## 🎨 **UI Features**

### **Color Coding**
- **Purple** - Dashboard category
- **Green** - Products category
- **Yellow** - Orders category
- **Purple** - Catalog category
- **Pink** - Customers category
- **Gray** - System category

### **Visual Indicators**
- **"User Override" badge** - Shows customized permissions
- **Active/Inactive status** - Green (●Active) or Red (●Inactive)
- **Role badges** - Color-coded by role

### **Responsive Design**
- Mobile-friendly user cards
- Scrollable permission list in modal
- Touch-friendly checkboxes

---

## 📝 **Best Practices**

### **1. Start with Roles**
- Configure role permissions first (Super Admin, Shop Manager, Salesman)
- Only use user-specific permissions for exceptions

### **2. Document Exceptions**
- Keep notes on why specific users have custom permissions
- Review quarterly to ensure permissions are still needed

### **3. Principle of Least Privilege**
- Grant only the permissions users need for their job
- Remove permissions when no longer needed
- Use temporary access for one-time tasks

### **4. Regular Audits**
- Monthly: Review active users and their permissions
- Quarterly: Check for unused accounts
- Annually: Verify all permissions are still appropriate

### **5. Test Before Granting**
- Log in as the user to test their access
- Verify sensitive data is properly hidden
- Ensure they can complete their tasks

---

## 🔧 **API Endpoints**

### **User Management**
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user (full update)
- `PATCH /api/admin/users/[id]` - Update user (partial, like status toggle)
- `DELETE /api/admin/users/[id]` - Delete user

### **User Permissions**
- `GET /api/admin/users/[id]/permissions` - Get user's effective permissions
- `PUT /api/admin/users/[id]/permissions` - Update user-specific permissions

### **Role Permissions**
- `GET /api/admin/role-permissions` - Get role permission matrix
- `PUT /api/admin/role-permissions` - Update role permissions

---

## 🐛 **Troubleshooting**

### **"Failed to load user permissions"**
- Check database connection
- Verify user exists
- Check browser console for errors

### **"Cannot delete the super admin"**
- This is intentional - primary super admin cannot be deleted
- Create a new super admin first (if you really need to change it)

### **User permissions not saving**
- Check for browser console errors
- Verify Super Admin access
- Check database connection

### **Permission changes not taking effect**
- User must log out and log back in
- Clear browser cache if needed
- Check that permissions were actually saved (look for success message)

---

## 🚀 **Advanced Features**

### **Bulk Permission Management** (Future)
- Select multiple users
- Apply same permission change to all
- Coming in next update

### **Permission Templates** (Future)
- Save common permission sets
- Apply templates to new users
- Coming soon

### **Audit Logging** (Future)
- Track who changed permissions
- View permission history
- Compliance reporting

---

## 📚 **Related Documentation**

- **PERMISSIONS_SETUP.md** - Complete permission system setup
- **CLAUDE.md** - Overall project documentation
- **Database migrations** - `/db/migrations/0006_breezy_trish_tilby.sql`

---

## ✅ **Quick Reference**

### **To Edit a User:**
1. Go to `/admin/users`
2. Click "✏️ Edit & Permissions" on user card
3. Update details and/or permissions
4. Click "Save User Details" or "Save Permissions"

### **To Delete a User:**
1. Go to `/admin/users`
2. Click "🗑️" on user card
3. Confirm deletion
4. User and their custom permissions are removed

### **To Grant Specific Permission:**
1. Edit user
2. Scroll to relevant category
3. Check the permission checkbox
4. Save permissions

### **To Remove Specific Permission:**
1. Edit user
2. Scroll to relevant category
3. Uncheck the permission checkbox
4. Save permissions

---

**Last Updated:** November 29, 2025
**Version:** 2.0.0 - Individual User Permission Management
