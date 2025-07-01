import React from 'react'
import { SVGGreenVector, SVGErrorVector } from '~/assets/svg'

export type StepStatus = 'unfilled' | 'filled' | 'error'
type TextPosition = 'top' | 'bottom'

interface StepProps {
  number: number
  label: string
  status: StepStatus
  textPosition?: TextPosition
}

interface StepsIndicatorProps {
  steps: Array<{
    number: number
    label: string
    status: StepStatus
  }>
  connectorHeight?: string
}

const Step: React.FC<StepProps> = ({
  number,
  label,
  status,
  textPosition = 'bottom'
}) => {
  const getBorderColor = () => {
    if (status === 'error') return 'border-black'
    return 'border-purple-300'
  }

  const getStepContent = () => {
    if (status === 'filled') {
      return (
        <div className="flex items-center justify-center">
          <SVGGreenVector />
        </div>
      )
    } else if (status === 'error') {
      return (
        <div className="flex items-center justify-center">
          <SVGErrorVector />
        </div>
      )
    } else {
      return (
        <div className="text-purple-600 font-bold">
          <span className="text-lg leading-lg">{number}</span>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col ${textPosition === 'top' ? 'flex-col-reverse' : 'flex-col'} items-center gap-1`}
      >
        {/* Step circle */}
        <div
          className={`
          w-[60px] h-[60px]
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
    </div>
  )
}

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({ steps }) => {
  const step1 = steps[0] || {
    number: 1,
    label: 'Step 1',
    status: 'unfilled' as StepStatus
  }
  const step2 = steps[1] || {
    number: 2,
    label: 'Step 2',
    status: 'unfilled' as StepStatus
  }

  return (
    <div className="flex flex-col items-center">
      <Step
        number={step1.number}
        label={step1.label}
        status={step1.status}
        textPosition="bottom"
      />

      <div className={`w-px bg-purple-300 h-[115px]`}></div>

      <Step
        number={step2.number}
        label={step2.label}
        status={step2.status}
        textPosition="bottom"
      />
    </div>
  )
}

export default StepsIndicator
