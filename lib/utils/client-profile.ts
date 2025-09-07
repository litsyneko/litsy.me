export function calculateProfileCompleteness(user: any): { percentage: number; missingFields: string[] } {
  const fields = [
    { key: 'email', label: '이메일', value: user?.email || user?.emailAddresses?.[0]?.emailAddress },
    { key: 'nickname', label: '닉네임', value: user?.publicMetadata?.nickname },
    { key: 'username', label: 'username', value: user?.username },
    { key: 'avatar_url', label: '프로필 사진', value: user?.imageUrl || user?.avatar_url },
    { key: 'bio', label: '자기소개', value: user?.publicMetadata?.bio || user?.bio }
  ]

  const completedFields = fields.filter(field => field.value && String(field.value).trim() !== '')
  const missingFields = fields.filter(field => !field.value || String(field.value).trim() === '').map(field => field.label)

  return {
    percentage: Math.round((completedFields.length / fields.length) * 100),
    missingFields
  }
}

export function getUserDisplayName(user: any): string {
  if (user?.publicMetadata?.nickname) return user.publicMetadata.nickname;
  if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
  if (user?.username) return user.username;
  if (user?.emailAddresses?.[0]?.emailAddress) return user.emailAddresses[0].emailAddress.split('@')[0];
  if (user?.email) return user.email.split('@')[0];
  return 'User';
}

export function getUserAvatarUrl(user: any): string | null {
  return user?.imageUrl || user?.avatar || null;
}

export function getUserInitials(user: any): string {
  if (user?.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user?.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
  }
  if (user?.email) return user.email.charAt(0).toUpperCase();
  return '?';
}

export function getAccountType(user: any): 'oauth' | 'email' {
  if (user?.publicMetadata?.provider === 'discord') return 'oauth';
  if (user?.externalAccounts && user.externalAccounts.length > 0) return 'oauth';
  if (user?.emailAddresses && user.emailAddresses.length > 0) return 'email';
  if (user?.email) return 'email';
  return 'email';
}
