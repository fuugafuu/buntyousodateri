async function requireAdmin(sb,user){
  if(!sb||!user?.id)throw Object.assign(new Error('ログインが必要です。'),{status:401});
  const {data,error}=await sb.from('mofumori_admins')
    .select('user_key,role,permissions,admin_bird_enabled,created_at,updated_at')
    .eq('user_key',user.id).maybeSingle();
  if(error)throw error;
  if(!data)throw Object.assign(new Error('管理者権限がありません。'),{status:403});
  return {role:data.role,permissions:data.permissions||{},adminBirdEnabled:data.admin_bird_enabled===true,createdAt:data.created_at,updatedAt:data.updated_at};
}
module.exports={requireAdmin};
