import { Clock, Mail, MapPin } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '../components/SocialIcons'
import type { ContactDetail, SocialLink } from '../types'

export const contactDetails: ContactDetail[] = [
  { label: 'Location', value: 'Cebu City, Philippines', icon: MapPin },
  { label: 'Email', value: 'hello@kemencoffee.example', icon: Mail },
  { label: 'Business Hours', value: '8:00 AM – 10:00 PM', icon: Clock },
]

export const socialLinks: SocialLink[] = [
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'Facebook', icon: FacebookIcon },
  { label: 'TikTok', icon: TikTokIcon },
]
