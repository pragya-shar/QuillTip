import Image from 'next/image'
import { User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProfileHeaderProps {
  user: {
    id: string
    username: string
    name?: string | null
    bio?: string | null
    avatar?: string | null
    createdAt: Date | string
    articleCount: number
  }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || user.username}
              width={120}
              height={120}
              className="w-[120px] h-[120px] rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-brand-blue text-white flex items-center justify-center text-4xl font-bold border-4 border-gray-100">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-grow">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.name || user.username}
            </h1>
            <p className="text-lg text-gray-600">@{user.username}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-4 max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <User className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.articleCount}</p>
                <p className="text-gray-600">
                  {user.articleCount === 1 ? 'Article' : 'Articles'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <Calendar className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-gray-600">
                  Member {memberSince}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}