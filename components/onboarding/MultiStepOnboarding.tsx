'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  content: ReactNode;
  optional?: boolean;
}

interface MultiStepOnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  allowSkip?: boolean;
}

export function MultiStepOnboarding({
  steps,
  onComplete,
  allowSkip = true,
}: MultiStepOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(step.id);
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 flex items-center justify-center p-4">
      <Container maxWidth="lg" padding>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {step.icon}
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text">
              Welcome to PathForge
            </h1>
            <p className="text-lg text-slate-400">
              Step {currentStep + 1} of {steps.length}: {step.title}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Your Journey Begins</span>
              <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 glow-cyan-intense"
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => {
                  if (i <= currentStep) {
                    setCurrentStep(i);
                  }
                }}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < currentStep
                    ? 'bg-emerald-600 text-white'
                    : i === currentStep
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white glow-cyan-intense'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {i < currentStep ? <Check size={16} /> : i + 1}
              </motion.button>
            ))}
          </div>

          {/* Content Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="space-y-6">
                {/* Description */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    {step.title}
                  </h2>
                  <p className="text-slate-300">{step.description}</p>
                </div>

                {/* Main Content */}
                <div className="border-t border-b border-white/10 py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {step.content}
                  </motion.div>
                </div>

                {/* Optional Badge */}
                {step.optional && (
                  <div className="text-center">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                      Optional Step
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-between pt-4">
                  {/* Previous Button */}
                  <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Button>

                  {/* Skip Button */}
                  {allowSkip && (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                    >
                      {isLastStep ? 'Finish' : 'Skip'}
                    </Button>
                  )}

                  {/* Next Button */}
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {isLastStep ? 'Complete Journey' : 'Next'}
                    {!isLastStep && <ChevronRight size={18} />}
                  </Button>
                </div>

                {/* Completion Indicator */}
                {isLastStep && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-emerald-400"
                  >
                    You're almost ready to begin your epic quest!
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Estimated Time */}
          <div className="text-center text-sm text-slate-500">
            Estimated time: {steps.length * 2} minutes
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
