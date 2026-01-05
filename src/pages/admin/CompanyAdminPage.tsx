import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCompanyStore } from '../../store/useCompanyStore';
import { ICompany } from '../../types/entities';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Building2, Users } from 'lucide-react';
import { CompanyDetailsSection } from './CompanyAdmin/CompanyDetailsSection';
import { UsersAndInvitesSection } from './CompanyAdmin/UsersAndInvitesSection';

type SectionType = 'details' | 'users-invites';

const CompanyAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companiesLoaded, getCompanyById } = useCompanyStore();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('details');
  const { t } = useTranslation();

  const fetchCompany = async () => {
    if (id) {
      const fetchedCompany = getCompanyById(id);
      setCompany(fetchedCompany || null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id, companiesLoaded]);

  if (isLoading) {
    return (
      <AdminPageContainer>
        <TextComponent text={t('common.pleaseWait')} size="medium" />
      </AdminPageContainer>
    );
  }

  if (!company) {
    return (
      <AdminPageContainer>
        <TextComponent text="Company not found" size="medium" />
      </AdminPageContainer>
    );
  }

  const menuItems = [
    {
      id: 'details' as SectionType,
      label: 'Company Details',
      icon: Building2,
    },
    {
      id: 'users-invites' as SectionType,
      label: 'Users & Invites',
      icon: Users,
    },
  ];

  return (
    <AdminPageContainer>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-[calc(100vh-4rem)] w-full">
          <Sidebar className="h-full">
            <SidebarHeader>
              <h2 className="text-lg font-semibold">Company Admin</h2>
              <p className="text-sm text-muted-foreground">{company.name}</p>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto p-6">
            {activeSection === 'details' && (
              <CompanyDetailsSection
                company={company}
                onUpdate={fetchCompany}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {activeSection === 'users-invites' && (
              <UsersAndInvitesSection company={company} />
            )}
          </main>
        </div>
      </SidebarProvider>
    </AdminPageContainer>
  );
};

export { CompanyAdminPage };
