import { Context, Schema } from 'koishi'
import {} from '@koishijs/plugin-adapter-onebot'

export const name = 'qqgroup-manager'

export interface Config {
  setGroupAdmin: number
  setGroupKick: number
  rejectAddRequest: boolean
  setGroupWholeBan: number
  setGroupBan: number
  setSelfBan: number
  setGroupCard: number
  setSelfSpecialTitle: number
  setGroupSpecialTitle: number
}

export const Config: Schema<Config> = Schema.object({
  setGroupAdmin: Schema.number().default(4).description('可设置管理员的权限等级。'),
  setGroupKick: Schema.number().default(4).description('可踢出群聊的权限等级。'),
  rejectAddRequest: Schema.boolean().default(false).description('踢出群聊后是否拒绝加群请求。'),
  setGroupWholeBan: Schema.number().default(4).description('可开关全员禁言的权限等级。'),
  setGroupBan: Schema.number().default(4).description('可开关禁言的权限等级。'),
  setSelfBan: Schema.number().default(1).description('可自我禁言的权限等级。'),
  setGroupCard: Schema.number().default(4).description('可修改群名片的权限等级。'),
  setSelfSpecialTitle: Schema.number().default(1).description('可申请头衔的权限等级。'),
  setGroupSpecialTitle: Schema.number().default(4).description('可修改头衔的权限等级。'),
}).description('权限设置')

export function apply(ctx: Context, config: Config) {

  // 升为管理
  ctx.command('manager','群管工具组').subcommand('升为管理 <qq:user>', '如：取消管理 @user(前需要空格)', {authority: config.setGroupAdmin, checkArgCount: true})
    .usage('样例：升为管理 @user(前需要空格)')
    .action(async ({session}, qq)=>{
      const [platform, qqnum] = qq.split(':')
      session.onebot.setGroupAdmin(
				session.guildId,
				qqnum,
			  true,
			)
      const {nickname} = await session.onebot.getGroupMemberInfo(
        session.guildId,
				qqnum,
			  false,
      )
      return nickname+'升为了管理~';
    })

  // 取消管理
  ctx.command('manager','群管工具组').subcommand('取消管理 <qq:user>', '如：取消管理 @user(前需要空格)', {authority: config.setGroupAdmin, checkArgCount: true})
    .action(async ({session}, qq)=>{
      const [platform, qqnum] = qq.split(':')
      session.onebot.setGroupAdmin(
				session.guildId,
				qqnum,
			  false,
			)
      const {nickname} = await session.onebot.getGroupMemberInfo(
        session.guildId,
				qqnum,
			  false,
      )
      return '残念~'+nickname+'失去了管理员资格~';
    })
  
  // 踢出群聊
  ctx.command('manager','群管工具组').subcommand('踢出群聊 <qq:user>','如：踢出群聊 @user(前需要空格)', {authority: config.setGroupKick, checkArgCount: true})
    .action(async ({session}, qq)=>{
      const [platform, qqnum] = qq.split(':')
      const {nickname} = await session.onebot.getGroupMemberInfo(
        session.guildId,
				qqnum,
			  false,
      )
      session.onebot.setGroupKick(
				session.guildId,
				qqnum,
			  config.rejectAddRequest,
			)
      return '残念~'+nickname+'被放逐啦~';
    })

  // 开启全员禁言
  ctx.command('manager','群管工具组').subcommand('开启全员禁言', {authority: config.setGroupWholeBan, checkArgCount: true})
    .action(({session})=>{
      session.onebot.setGroupWholeBan(
				session.guildId,
			  true,
			)
      return '全员自闭开始~';
    })

  // 关闭全员禁言
  ctx.command('manager','群管工具组').subcommand('解除全员禁言', {authority: config.setGroupWholeBan, checkArgCount: true})
    .action(({session})=>{
      session.onebot.setGroupWholeBan(
				session.guildId,
			  false,
			)
      return '全员自闭结束~';
    })

  // 禁言
  ctx.command('manager','群管工具组').subcommand('禁言 <qq:user> <duration:number> <type>','如：禁言 @user(前后需要空格) 1 分钟',{authority: config.setGroupBan, checkArgCount: true})
    .action(({session}, qq, duration, type)=>{
      const [platform, qqnum] = qq.split(':')
      switch(type){
        case '秒':
        case '秒钟':
          break;
        case '分':
        case '分钟':
          duration = duration*60
          break;
        case '时':
        case '小时':
          duration = duration*3600
          break;
        default: return '请输入秒/秒钟/分/分钟/时/小时'
      }
      if(duration > 2591999){
				duration = 2591999 // qq禁言最大时长为一个月
			}
      session.onebot.setGroupBan(
				session.guildId,
				qqnum,
			  duration, // 要禁言的时间（秒）
			)
      return '小黑屋收留成功~';
    })

  // 解除禁言
  ctx.command('manager','群管工具组').subcommand('解除禁言 <qq:user>','如：解除禁言 @user(前需要空格)',{authority: config.setGroupBan, checkArgCount: true})
    .action(({session}, qq)=>{
      const [platform, qqnum] = qq.split(':')
      session.onebot.setGroupBan(
				session.guildId,
				qqnum,
			  0, // 要禁言的时间（秒）
			)
      return '小黑屋释放成功~';
    })

  // 自闭禁言
  ctx.command('manager').subcommand('我要自闭 <duration:number> <type>','如：我要自闭 1 分钟',{authority: config.setSelfBan,checkArgCount: true})
    .action(({session}, duration, type)=>{
      switch(type){
        case '秒':
          case '秒钟':
            break;
          case '分':
          case '分钟':
            duration = duration*60
            break;
          case '时':
          case '小时':
            duration = duration*3600
            break;
          default: return '请输入秒/秒钟/分/分钟/时/小时'
      }
      if(duration > 2591999){
				duration = 2591999 // qq禁言最大时长为一个月
			}
      session.onebot.setGroupBan(
				session.guildId,
				session.userId,
			  duration, // 要禁言的时间（秒）
			)
      return '那我就不手下留情了~';
    })

  // 修改名片
  ctx.command('manager').subcommand('修改名片 <qq:user> <text:string>','如：修改名片 @user(前后需要空格) 恋恋',{authority: config.setGroupCard, checkArgCount: true})
    .action(({session}, qq, text)=>{
      const [platform, qqnum] = qq.split(':')
      if(text.length > 60){ // 长度限制60，1汉字=3，在做了
				return '名字太长啦！';
			}
      session.onebot.setGroupCard(
				session.guildId,
				qqnum,
			  text,
			)
      return '嗯！已经改好啦~';
    })
  
  // 申请头衔
  ctx.command('manager').subcommand('申请头衔 <text:string>','如：申请头衔 恋恋',{authority: config.setSelfSpecialTitle, checkArgCount: true})
    .action(({session},text)=>{
      if(text.length > 18){ // 长度限制18，1汉字=3，在做了
				return '头衔太长啦！';
			}
      session.onebot.setGroupSpecialTitle(
				session.guildId,
				session.userId,
			  text,
			)
      return '嗯！不错的头衔呢~';
    })

  // 修改头衔
  ctx.command('manager').subcommand('修改头衔 <qq:user> <text:string>','如：修改头衔 @user(前后需要空格) 恋恋',{authority: config.setGroupSpecialTitle, checkArgCount: true})
    .action(({session}, qq, text)=>{
      const [platform, qqnum] = qq.split(':')
      if(text.length > 18){ // 长度限制18，1汉字=3，在做了
				return '头衔太长啦！';
			}
      session.onebot.setGroupSpecialTitle(
				session.guildId,
				qqnum,
			  text,
			)
      return '嗯！已经改好啦~';
    })
}