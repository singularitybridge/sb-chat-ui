import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useCompanyStore } from '../../store/useCompanyStore';
import { ICompany } from '../../types/entities';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import { Building2, Users, ArrowLeft } from 'lucide-react';
import { CompanyDetailsSection } from './CompanyAdmin/CompanyDetailsSection';
import { UsersAndInvitesSection } from './CompanyAdmin/UsersAndInvitesSection';
import { Button } from '@/components/ui/button';

type SectionType = 'details' | 'users-invites';

const CompanyAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { companiesLoaded, getCompanyById } = useCompanyStore();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('details');
  // mobileView state controls which panel is visible on mobile (<768px)
  // On desktop (>=768px), nav is always visible via CSS
  const [mobileView, setMobileView] = useState<'nav' | 'content'>('nav');
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

  const menuItems = [
    {
      id: 'details' as SectionType,
      label: t('EditCompanyPage.title'),
      icon: Building2,
    },
    {
      id: 'users-invites' as SectionType,
      label: 'Users & Invites',
      icon: Users,
    },
  ];

  const handleSectionClick = (sectionId: SectionType) => {
    setActiveSection(sectionId);
    setMobileView('content');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center h-full">
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7">
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('common.pleaseWait')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center h-full">
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7">
          <div className="text-center py-8 text-muted-foreground">
            <p>Company not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-full">
      <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7">
        {/* Navigation Panel - hidden on mobile when viewing content, always visible on desktop */}
        <div className={`flex flex-col rounded-lg md:max-w-xs w-full ${mobileView === 'content' ? 'hidden' : 'flex'} md:flex`}>
          {/* Header */}
          <div className="mb-6">
            <TextComponent
              text={company.name}
              size="subtitle"
            />
            <p className="text-sm text-muted-foreground mt-1">Company Settings</p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Panel - hidden on mobile when viewing nav, always visible on desktop */}
        <div className={`grow min-w-0 ${mobileView === 'nav' ? 'hidden' : 'flex flex-col'} md:block`}>
          {/* Mobile Back Button */}
          <div className="md:hidden mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileView('nav')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
          </div>

          {/* Content */}
          <div className="bg-card rounded-lg border border-border h-full flex flex-col overflow-hidden">
            {activeSection === 'details' && (
              <CompanyDetailsSection company={company} />
            )}
            {activeSection === 'users-invites' && (
              <div className="p-6">
                <UsersAndInvitesSection company={company} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CompanyAdminPage };
