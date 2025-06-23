import React from 'react'

type StepStatus = 'unfilled' | 'filled' | 'error'

type TextPosition = 'top' | 'bottom'

interface StepProps {
  /** step number (1, 2, 3, etc.) */
  number: number
  /** text label for the step */
  label: string
  /** current state of the step */
  status: StepStatus
  /** whether to show connecting line after this step */
  showConnector?: boolean
  /** where to position the label text */
  textPosition?: TextPosition
  /** whether to use mobile styling */
  isMobile?: boolean
}

interface StepsIndicatorProps {
  /** array of step information */
  steps: Array<{
    number: number
    label: string
    status: StepStatus
  }>
  /** where to position the label text */
  textPosition?: TextPosition
  /** whether to use mobile styling */
  isMobile?: boolean
}

const Step: React.FC<StepProps> = ({
  number,
  label,
  status,
  showConnector = false,
  textPosition = 'bottom',
  isMobile = false
}) => {
  // determine border color based on status
  const getBorderColor = () => {
    if (status === 'error') return 'border-black'
    return 'border-purple-300' // #8075b3
  }

  // get step content based on status
  const getStepContent = () => {
    if (status === 'filled') {
      return (
        <div className="flex items-center justify-center">
          <svg
            width={isMobile ? 16 : 24}
            height={isMobile ? 16 : 24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"
              fill="#4AB7A5"
            />
          </svg>
        </div>
      )
    } else if (status === 'error') {
      return (
        <div className="flex items-center justify-center">
          <svg
            width={isMobile ? 16 : 24}
            height={isMobile ? 16 : 24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill="#E51D25"
            />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="text-purple-600 font-bold">
          {isMobile ? (
            <span className="text-sm leading-md">{number}</span>
          ) : (
            <span className="text-lg leading-lg">{number}</span>
          )}
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Container for step circle and label based on textPosition */}
      <div
        className={`flex flex-col ${textPosition === 'top' ? 'flex-col-reverse' : 'flex-col'} items-center gap-1`}
      >
        {/* Step circle */}
        <div
          className={`
          ${isMobile ? 'w-6 h-6' : 'w-[60px] h-[60px]'} 
          rounded-full border 
          ${getBorderColor()} 
          flex items-center justify-center
        `}
        >
          {getStepContent()}
        </div>

        {/* Label */}
        <div className="text-text-primary text-xs leading-xs font-normal text-center">
          {label}
        </div>
      </div>

      {/* Connector line */}
      {showConnector && <div className="h-10 w-px bg-purple-300 mt-1"></div>}
    </div>
  )
}

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({
  steps,
  textPosition = 'bottom',
  isMobile = false
}) => {
  return (
    <div className="flex flex-row items-start justify-center space-x-8">
      {steps.map((step, index) => (
        <Step
          key={step.number}
          number={step.number}
          label={step.label}
          status={step.status}
          showConnector={index < steps.length - 1}
          textPosition={textPosition}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}

export default StepsIndicator
