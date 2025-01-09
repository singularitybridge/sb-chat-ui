import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import Button from '../../components/sb-core-ui-kit/Button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { Shield, ExternalLink, Lock } from 'lucide-react';
import { getToken } from '../../services/api/authService';

const WorkspaceAuthorizePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const appData = {
    appId: searchParams.get('appId') || '',
    appName: decodeURIComponent(searchParams.get('appName') || ''),
    redirectUrl: decodeURIComponent(searchParams.get('redirectUrl') || '')
  };

  const handleApprove = () => {
    const userToken = getToken();
    if (!userToken) {
      console.error('No user token found');
      return;
    }
    
    // Construct redirect URL with auth key
    const redirectUrl = `${appData.redirectUrl}?auth_key=${userToken}`;
    
    // Redirect to the specified URL
    window.location.href = redirectUrl;
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex justify-center h-full">
      <div className="flex w-full max-w-7xl space-x-7 rtl:space-x-reverse">
        <div className="flex flex-col rounded-lg max-w-sm w-full">
          <ChatContainer />
        </div>
        <div className="flex-grow max-w-3xl w-full">
          <div className="bg-white rounded-lg h-full p-6 shadow-sm" dir="rtl">
            <Card className="max-w-xl w-full mx-auto border-0 shadow-none">
              <CardHeader className="text-center border-b pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} />
                </div>
                <CardTitle className="text-2xl mb-2">אישור גישה ליישום חיצוני</CardTitle>
                <p className="text-gray-600">
                  היישום {appData.appName} מבקש גישה לחשבונך
                </p>
              </CardHeader>
              
              <CardContent className="py-6 space-y-6">
                {/* App Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full w-6 h-6 flex items-center justify-center">
                      <ExternalLink size={14} />
                    </div>
                    <span className="text-gray-600">{appData.redirectUrl}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-full w-6 h-6 flex items-center justify-center">
                      <Lock size={14} />
                    </div>
                    <span className="text-gray-600">{appData.appName}</span>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="font-semibold mb-3">היישום יקבל גישה ל:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">•</div>
                      <span>צפייה במידע הבסיסי של החשבון שלך</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">•</div>
                      <span>שליחה וקבלה של הודעות בשמך</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">•</div>
                      <span>ביצוע פעולות מותרות בהתאם להרשאות החשבון שלך</span>
                    </li>
                  </ul>
                </div>

                {/* Security Notice */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription>
                    שים לב: אשר גישה רק ליישומים שאתה סומך עליהם. תוכל לבטל גישה זו בכל עת דרך הגדרות החשבון.
                  </AlertDescription>
                </Alert>
              </CardContent>

              <CardFooter className="border-t pt-6 flex gap-4 flex-col sm:flex-row">
                <Button 
                  variant="secondary"
                  additionalClassName="flex-1 !bg-red-100 !text-red-700 hover:!bg-red-200"
                  onClick={handleCancel}
                >
                  בטל
                </Button>
                <Button 
                  variant="primary"
                  additionalClassName="flex-1"
                  onClick={handleApprove}
                >
                  אשר גישה
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAuthorizePage;
