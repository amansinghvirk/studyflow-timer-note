import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AppSettings } from '../App'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
  enabled: boolean

  notes: string
  settings: 
  onEnhanced: (
}
  enabled: boolean
 

  },
    id: 'rewrit
  topic: string
  },
    id: 'insights',
    description: 'Add key insights and takeaw
  },
 

  },
   
    description: '
  }

  notes,
  se
  o
}: AINotesEnhancer
  const [currentStep, setCurr
  const [progress, setProgress] = useState(0)
  const enhanceNo
    
   
    setIsEnhancing(
    
      const enabledSteps = enhancementSteps.filter(step => st
      
    
   
        const prompt
          
          ${result}
          Enhance
    
   
          ${step.i
          ${step.id === 'question
          
        `
   
 

        } catch (error) {
        
  topic,
      
      setP
      
      co
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)

    if (enhancedContent) {
  const [progress, setProgress] = useState(0)


    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogHeader>
        </Di
    }

                AI will 
              
    
    try {
                      <div className="font-medium">{step.title}</div>
                    </di
      
              
                <Button onClick={enh
                </Button>
                  Cancel
        
          )}
          {isEnhancing && (
          
                <p class
                </p
          
          )}
          
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    Apply Enhancements
                  <Button variant="outline" onClick={onClose}>
                  </Button>
              </div>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          
              </ScrollArea>
         
        
  )









        }
      }


      setProgress(100)


    } catch (error) {


    } finally {
      setIsEnhancing(false)

  }






    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>

        </DialogHeader>



            <div className="space-y-4">











                    </div>


              </div>






                  Cancel
                </Button>
              </div>

          )}

          {isEnhancing && (

              <div className="text-center">
                <h3 className="font-medium mb-2">Enhancing your notes...</h3>





            </div>















              

                <div className="prose prose-sm max-w-none">



                </div>


          )}

      </DialogContent>

  )
}