import { Toast } from "@/components/ui/toast"

type ToastProps = React.ComponentProps<typeof Toast>

export function toast({ title, description, variant = "default" }: {
  title?: string
  description?: string
  variant?: ToastProps["variant"]
}) {
  return {
    title,
    description,
    variant,
  }
}
