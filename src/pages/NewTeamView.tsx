import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InputWithLabel from '../components/sb-core-ui-kit/InputWithLabel';
import { TextareaWithLabel } from '../components/sb-core-ui-kit/TextareaWithLabel';
import { Wand2, Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { emitter } from '../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../utils/eventNames';

interface AvatarOption {
  styleIndex: number;
  path: string;
  downloadUrl: string;
  blobUrl?: string; // Add blob URL for authenticated image loading
}

const NewTeamView: React.FC = observer(() => {
  const { t } = useTranslation();
  const rootStore = useRootStore();

  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch avatar images with authentication and create blob URLs
  useEffect(() => {
    const fetchAvatarImages = async () => {
      if (avatars.length === 0) return;

      const token = localStorage.getItem('userToken');
      const updatedAvatars = await Promise.all(
        avatars.map(async (avatar) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}${avatar.downloadUrl}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                responseType: 'blob',
              }
            );
            const blobUrl = URL.createObjectURL(response.data);
            return { ...avatar, blobUrl };
          } catch (error) {
            console.error(`Failed to load avatar ${avatar.styleIndex}:`, error);
            return avatar;
          }
        })
      );
      setAvatars(updatedAvatars);
    };

    fetchAvatarImages();

    // Cleanup blob URLs on unmount
    return () => {
      avatars.forEach((avatar) => {
        if (avatar.blobUrl) {
          URL.revokeObjectURL(avatar.blobUrl);
        }
      });
    };
  }, [avatars.length]); // Only run when avatars are first set

  const handleGenerateAvatars = async () => {
    if (!teamName || !teamPurpose) {
      setError('Please provide both team name and purpose');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/create-with-wizard`,
        {
          teamName,
          teamPurpose,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 360000, // 6 minutes timeout for DALL-E generation
        }
      );

      setAvatars(response.data.avatars);
      setStep(3);
    } catch (err: any) {
      console.error('Failed to generate avatars:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.fallback ||
        'Failed to generate avatars. You can try again or create manually.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTeam = async () => {
    if (selectedAvatar === null) {
      setError('Please select an avatar');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/create-with-wizard`,
        {
          teamName,
          teamPurpose,
          selectedAvatarIndex: selectedAvatar,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 seconds timeout for team creation
        }
      );

      // Refresh teams in store
      await rootStore.fetchTeams();

      // Close the modal
      emitter.emit(EVENT_CLOSE_MODAL);
    } catch (err: any) {
      console.error('Failed to create team:', err);
      setError(err.response?.data?.message || 'Failed to create team');
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
        <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Name your team</h3>
        <p className="text-sm text-gray-500">
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
          className="w-full bg-purple-600 hover:bg-purple-700 mt-6 py-3 text-base font-medium"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );

  const handleStep2Submit = () => {
    if (!teamPurpose.trim() || isGenerating) return;
    handleGenerateAvatars();
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Describe your team</h3>
        <p className="text-sm text-gray-500">
          Tell us what this team does and we'll create custom avatars
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
            disabled={!teamPurpose.trim() || isGenerating}
            className="flex-[1.2] bg-purple-600 hover:bg-purple-700 py-3 text-base font-medium whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Avatars
                <Wand2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  const handleStep3Submit = () => {
    if (selectedAvatar === null || isCreating) return;
    handleCreateTeam();
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold">Pick your favorite</h3>
        <p className="text-sm text-gray-500">
          Select the avatar that best represents your team
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleStep3Submit(); }}>
        <div className="grid grid-cols-3 gap-3">
          {avatars.map((avatar) => (
            <button
              key={avatar.styleIndex}
              type="button"
              onClick={() => setSelectedAvatar(avatar.styleIndex)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${
                  selectedAvatar === avatar.styleIndex
                    ? 'border-purple-600 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <img
                src={avatar.blobUrl || `${import.meta.env.VITE_API_URL}${avatar.downloadUrl}`}
                alt={`Avatar style ${avatar.styleIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedAvatar === avatar.styleIndex && (
                <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                  <div className="bg-purple-600 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
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
              setSelectedAvatar(null);
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
            disabled={selectedAvatar === null || isCreating}
            className="flex-[1.2] bg-purple-600 hover:bg-purple-700 py-3 text-base font-medium"
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }
              `}
            >
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`
                  w-12 h-0.5 transition-colors
                  ${step > stepNum ? 'bg-purple-600' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card className="p-6 border-gray-200 shadow-sm">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Card>

      {/* Team info preview (steps 2-3) */}
      {step >= 2 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Preview</div>
          <div className="font-medium">{teamName}</div>
          <div className="text-sm text-gray-600 mt-1">{teamPurpose}</div>
        </div>
      )}
    </div>
  );
});

export { NewTeamView };
