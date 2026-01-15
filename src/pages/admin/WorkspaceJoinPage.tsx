import React from 'react';
import { PageLayout } from '../../components/admin/PageLayout';
import { WandIcon } from 'lucide-react';

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className='bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all border border-zinc-100'>
    <h3 className='text-xl font-semibold mb-2 text-zinc-900'>{title}</h3>
    <p className='text-zinc-600'>{description}</p>
  </div>
);

const StartButton: React.FC = () => (
  <button className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all max-w-md w-full flex items-center'>
    <div className='flex-1 text-right space-y-0.5'>
      <div className='px-8 pt-4 font-semibold text-xl'>התחל עכשיו בחינם</div>
      <div className='px-8 pb-4 text-xs font-normal'>
        התחל את 30 ימי הניסיון שלך עכשיו, ללא צורך בכרטיס אשראי. לאחר מכן 299 ש״ח לחודש
      </div>
    </div>
    <div className='px-4 border-r border-blue-500'>
      <div className='bg-blue-500 p-2 rounded-lg'>
        <WandIcon size={20} />
      </div>
    </div>
  </button>
);

const ProcessStep: React.FC<{ number: number; title: string; description: string }> = ({ number, title, description }) => (
  <div dir="rtl" className='flex items-start gap-2'>
    <div className='bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1'>
      {number}
    </div>
    <div className='flex-1'>
      <h4 className='font-semibold text-lg mb-1 text-zinc-900'>{title}</h4>
      <p className='text-zinc-600'>{description}</p>
    </div>
  </div>
);

export const WorkspaceJoinPage: React.FC = () => {
  const features = [
    {
      title: 'יצירה ללא קוד',
      description: 'בנה יישומים ודפים מותאמים אישית ללא ידע טכני'
    },
    {
      title: 'סיוע AI מתקדם',
      description: 'מערכת AI חכמה לניהול תוכן ואוטומציה של משימות'
    },
    {
      title: 'אינטגרציה מלאה',
      description: 'השתלבות חלקה עם מערכת הסוכנים החכמים הקיימת'
    },
    {
      title: 'לוחות מחוונים עסקיים',
      description: 'צור לוחות מחוונים מותאמים אישית למדדים העסקיים שלך'
    },
    {
      title: 'פורטל לקוחות',
      description: 'בנה ממשק אישי ללקוחות שלך בקלות ובמהירות'
    },
    {
      title: 'כלים פנים-ארגוניים',
      description: 'פתח מערכות פנימיות וזרימות עבודה מותאמות'
    }
  ];

  const howItWorks = [
    {
      number: 1,
      title: 'בחר תבנית או התחל מאפס',
      description: 'התחל עם תבנית מוכנה או צור פתרון מותאם אישית מאפס בעזרת הממשק האינטואיטיבי שלנו'
    },
    {
      number: 2,
      title: 'התאם בעזרת AI',
      description: 'השתמש במערכת ה-AI החכמה שלנו כדי ליצור תוכן, לעצב ממשקים ולהגדיר אוטומציות'
    },
    {
      number: 3,
      title: 'השק בקלות',
      description: 'פרסם את הפתרון שלך במהירות עם אבטחה ברמה ארגונית ותמיכה מקצועית'
    }
  ];

  return (
    <PageLayout variant="card">
      <div className="relative">
        {/* Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <div className='flex flex-col md:flex-row justify-between items-start gap-8 mb-12'>
            <div className='text-right order-2 md:order-1'>
              <h1 className='text-3xl font-bold mb-4 text-zinc-900'>מרחב עבודה חכם</h1>
              <p className='text-lg mb-8 text-zinc-600'>
                צור יישומים מותאמים אישית בעזרת AI, ללא צורך בידע טכני
              </p>
            </div>
            <div className='order-1 md:order-2'>
              <StartButton />
            </div>
          </div>

          {/* How It Works Section */}
          <div className='bg-blue-100 rounded-2xl p-6 mb-12'>
            <h2 className='text-2xl font-bold text-right mb-8 text-zinc-900'>איך זה עובד?</h2>
            <div className='flex flex-row-reverse gap-8'>
              {/* Image - 1/3 width */}
              <div className='w-1/3'>
                <div 
                  className="w-full h-full bg-contain bg-no-repeat bg-center" 
                  style={{ 
                    backgroundImage: 'url(/assets/workspace-join-bg.png)',
                  }} 
                />
              </div>
              {/* Steps - 2/3 width */}
              <div className='w-2/3'>
                <div className='flex flex-col gap-5'>
                  {howItWorks.map((step, index) => (
                    <ProcessStep key={index} {...step} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold text-right mb-8 text-zinc-900'>יתרונות ותכונות</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkspaceJoinPage;
