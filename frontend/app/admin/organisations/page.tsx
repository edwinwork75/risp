"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrganization, useAllOrganizations, useOrganizations } from "@/hooks/useOrganizations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Settings, Users, FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";

export default function OrganisationsPage() {
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const createOrganizationMutation = useCreateOrganization();
  
  // Use different hooks based on user role
  const { 
    data: userOrganizations = [], 
    isLoading: userOrgsLoading,
    error: userOrgsError 
  } = useOrganizations(user?.id);

  const { 
    data: allOrganizations = [], 
    isLoading: allOrgsLoading,
    error: allOrgsError 
  } = useAllOrganizations(isSuperAdmin);

  // Determine which data to use based on user role
  const organizations = isSuperAdmin ? allOrganizations : userOrganizations;
  const isLoading = isSuperAdmin ? allOrgsLoading : userOrgsLoading;
  const error = isSuperAdmin ? allOrgsError : userOrgsError;

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
  });

  const handleOrganizationClick = (orgId: string, orgName: string) => {
    // Navigate to organization admin dashboard
    toast.success(`Now managing ${orgName}`);
    router.push(`/admin/${orgId}/dashboard`);
  };

  const handleCreateOrganization = () => {
    // Only SuperAdmin can create organizations
    if (isSuperAdmin) {
      setIsCreateModalOpen(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    if (!formData.adminEmail.trim()) {
      toast.error("Admin email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.adminPassword.trim()) {
      toast.error("Admin password is required");
      return;
    }

    if (formData.adminPassword.trim().length < 6) {
      toast.error("Admin password must be at least 6 characters long");
      return;
    }

    if (!formData.adminName.trim()) {
      toast.error("Admin name is required");
      return;
    }

    try {
      await createOrganizationMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPassword: formData.adminPassword.trim(),
        adminName: formData.adminName.trim(),
      });
      
      // Reset form and close modal
      setFormData({ name: "", description: "", adminEmail: "", adminPassword: "", adminName: "" });
      setIsCreateModalOpen(false);
    } catch (error) {
      // Additional error handling is now done in the mutation hook
      console.error("Failed to create organization:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", adminEmail: "", adminPassword: "", adminName: "" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading organizations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            Error loading organizations. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? "Manage all organizations in the system" 
              : "Manage organizations and their settings"
            }
          </p>
        </div>
        
        {isSuperAdmin && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateOrganization}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter organization description (optional)"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
                
                {/* Divider and Admin User Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Organization Administrator</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Name *</Label>
                      <Input
                        id="adminName"
                        type="text"
                        placeholder="Enter admin full name"
                        value={formData.adminName}
                        onChange={(e) => handleInputChange("adminName", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="Enter admin email address"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Admin Password *</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Enter admin password (min 6 characters)"
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createOrganizationMutation.isPending}
                  >
                    {createOrganizationMutation.isPending ? "Creating..." : "Create Organization"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card 
            key={org.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleOrganizationClick(org.id, org.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {org.name}
                </CardTitle>
                {isSuperAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {org.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{org.orgUsers?.length || 0} members</span>
                </div>
                <div className="flex items-center">
                  <FolderKanban className="h-4 w-4 mr-1" />
                  <span>Manage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-500">
            {isSuperAdmin 
              ? "Create your first organization to get started." 
              : "You don't have access to any organizations yet."
            }
          </p>
        </div>
      )}
    </div>
  );
} 