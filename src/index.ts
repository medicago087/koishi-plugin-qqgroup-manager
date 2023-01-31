import { Context, Schema, sleep } from 'koishi'
import {} from '@koishijs/plugin-adapter-onebot'
import { randomInt } from 'crypto'

export const name = 'qqgroup-manager'

export const usage = `
## 注意事项
+ 本插件只使用权限等级作为判断依据，群主和管理员并不天然具有操作权限。
+ 请使用 \`authorize <value> -u <user>\` 为他人加权。若bot主人无权限，请修改数据库user表中authority字段为你想要的权限等级。
+ 注：vscqq等oicq用户暂不能使用回复消息相关功能。
`

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
  deleteMsg: number
  deleteMsgNotice: boolean
  setEssenceMsg: number
  setEssenceMsgCommand: string
  deleteEssenceMsgCommand: string
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
  deleteMsg: Schema.number().default(4).description('可撤回消息的权限等级。'),
  deleteMsgNotice: Schema.boolean().default(true).description('撤回消息后是否显示提示语'),
  setEssenceMsg: Schema.number().default(4).description('可设置精华消息的权限等级。'),
  setEssenceMsgCommand: Schema.string().default('设置精华消息').description('设置精华消息的指令。'),
  deleteEssenceMsgCommand: Schema.string().default('取消精华消息').description('取消精华消息的指令。'),
}).description('权限设置')

export function apply(ctx: Context, config: Config) {

  // 升为管理
  ctx.command('manager','群管工具组').subcommand('升为管理 <qq:user>', '如：取消管理 @user(前需要空格)', {authority: config.setGroupAdmin, checkArgCount: true})
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
  ctx.command('manager').subcommand('取消管理 <qq:user>', '如：取消管理 @user(前需要空格)', {authority: config.setGroupAdmin, checkArgCount: true})
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
  ctx.command('manager').subcommand('踢出群聊 <qq:user>','如：踢出群聊 @user(前需要空格)', {authority: config.setGroupKick, checkArgCount: true})
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
  ctx.command('manager').subcommand('开启全员禁言', {authority: config.setGroupWholeBan})
    .action(({session})=>{
      session.onebot.setGroupWholeBan(
				session.guildId,
			  true,
			)
      return '全员自闭开始~';
    })

  // 关闭全员禁言
  ctx.command('manager').subcommand('解除全员禁言', {authority: config.setGroupWholeBan})
    .action(({session})=>{
      session.onebot.setGroupWholeBan(
				session.guildId,
			  false,
			)
      return '全员自闭结束~';
    })

  // 禁言
  ctx.command('manager').subcommand('禁言 <qq:user> <duration:number> <type>','如：禁言 @user(前后需要空格) 1 分钟',{authority: config.setGroupBan, checkArgCount: true})
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
  ctx.command('manager').subcommand('解除禁言 <qq:user>','如：解除禁言 @user(前需要空格)',{authority: config.setGroupBan, checkArgCount: true})
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
      if(new TextEncoder().encode(text).length > 60){ // 长度限制60
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
      if(new TextEncoder().encode(text).length > 18){ // 长度限制18
				return '头衔太长啦！';
			}
      session.onebot.setGroupSpecialTitle(
				session.guildId,
				session.userId,
			  text,
			)
      return '已经改好啦~';
    })

  // 修改头衔
  ctx.command('manager').subcommand('修改头衔 <qq:user> <text:string>','如：修改头衔 @user(前后需要空格) 恋恋',{authority: config.setGroupSpecialTitle, checkArgCount: true})
    .action(({session}, qq, text)=>{
      const [platform, qqnum] = qq.split(':')
      if(new TextEncoder().encode(text).length > 18){ // 长度限制18
				return '头衔太长啦！';
			}
      session.onebot.setGroupSpecialTitle(
				session.guildId,
				qqnum,
			  text,
			)
      return '已经改好啦~';
    })

  // 撤回
  ctx.command('manager').subcommand('撤回', '回复一条消息 撤回', {authority: config.deleteMsg})
  .action(async ({session})=>{
    await session.onebot.deleteMsg(
      session.quote.messageId,
    )
    await sleep(randomInt(500,1000))
    await session.onebot.deleteMsg(
      session.messageId,
    )
    console.log(config.deleteMsgNotice)
    if(config.deleteMsgNotice === false){
      return;
    } else {
      return '已经撤回啦~';
    }
  })

  // 设精
  ctx.command('manager').subcommand(config.setEssenceMsgCommand, '回复一条消息 设置精华消息', {authority: config.setEssenceMsg})
  .action(({session})=>{
    session.onebot.setEssenceMsg(
      session.quote.messageId,
    )
    return '设置成功啦~';
  })

  // 取精
  ctx.command('manager').subcommand(config.deleteEssenceMsgCommand, '回复一条消息 取消精华消息', {authority: config.setEssenceMsg})
  .action(({session})=>{
    session.onebot.deleteEssenceMsg(
      session.quote.messageId,
    )
    return '取消成功啦~';
  })
}