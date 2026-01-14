import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTeamStore } from '../store/useTeamStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InputWithLabel from '../components/sb-core-ui-kit/InputWithLabel';
import { TextareaWithLabel } from '../components/sb-core-ui-kit/TextareaWithLabel';
import { Wand2, Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { emitter } from '../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../utils/eventNames';
import { IconPicker } from '../components/IconPicker';

const NewTeamView: React.FC = () => {
  const { t } = useTranslation();
  const { createTeam } = useTeamStore();
  const { userSessionInfo } = useAuthStore();

  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTeam = async () => {
    if (!selectedIcon) {
      setError(t('teams.selectIconError'));
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createTeam({
        name: teamName,
        description: teamPurpose,
        icon: selectedIcon,
        companyId: userSessionInfo.companyId,
      });

      toast.success(t('teams.createSuccess'));
      // Close the modal
      emitter.emit(EVENT_CLOSE_MODAL);
    } catch (err: any) {
      toast.error(t('teams.createError'));
      setError(err?.message || t('teams.createError'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleStep1Submit = () => {
    if (teamName.trim()) {
      setStep(2);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-violet mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Name your team</h3>
        <p className="text-sm text-muted-foreground">
          Choose a name that reflects your team's purpose
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleStep1Submit(); }}>
        <InputWithLabel
          id="teamName"
          label="Team Name"
          value={teamName}
          onChange={(value) => setTeamName(value)}
          autoFocus
        />

        <Button
          type="submit"
          disabled={!teamName.trim()}
          className="w-full bg-violet hover:bg-violet/90 mt-6 py-3 text-base font-medium"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );

  const handleStep2Submit = () => {
    if (!teamPurpose.trim()) return;
    setStep(3);
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-violet mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Describe your team</h3>
        <p className="text-sm text-muted-foreground">
          Tell us what this team does
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleStep2Submit(); }}>
        <TextareaWithLabel
          id="teamPurpose"
          label="Team Purpose"
          value={teamPurpose}
          onChange={(value) => setTeamPurpose(value)}
          rows={4}
          autoFocus
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mt-4">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            variant="outline"
            className="flex-[0.8]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!teamPurpose.trim()}
            className="flex-[1.2] bg-violet hover:bg-violet/90 py-3 text-base font-medium"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );

  const handleStep3Submit = () => {
    if (!selectedIcon || isCreating) return;
    handleCreateTeam();
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-violet mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Choose an icon</h3>
        <p className="text-sm text-muted-foreground">
          Select an icon that represents your team
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleStep3Submit(); }}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Team Icon
          </label>
          <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mt-4">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            onClick={() => {
              setStep(2);
              setError(null);
            }}
            variant="outline"
            className="flex-[0.8]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!selectedIcon || isCreating}
            className="flex-[1.2] bg-violet hover:bg-violet/90 py-3 text-base font-medium"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Team
                <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${
                  step >= stepNum
                    ? 'bg-violet text-violet-foreground'
                    : 'bg-secondary text-muted-foreground'
                }
              `}
            >
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`
                  w-12 h-0.5 transition-colors
                  ${step > stepNum ? 'bg-violet' : 'bg-secondary'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card className="p-6 border-border shadow-sm">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Card>

      {/* Team info preview (steps 2-3) */}
      {step >= 2 && (
        <div className="mt-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Preview</div>
          <div className="font-medium">{teamName}</div>
          <div className="text-sm text-muted-foreground mt-1">{teamPurpose}</div>
        </div>
      )}
    </div>
  );
};

export { NewTeamView };
