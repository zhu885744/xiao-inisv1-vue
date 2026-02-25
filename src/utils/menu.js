import cache from '@/utils/cache'
import utils from '@/utils/utils'
import { push } from '@/utils/route'
import { useAuthPagesStore } from '@/store/auth-pages'

const config = {
    menuWidth: 140,
    customClass: 'dark-howdy-menu scale-up-top-left',
    useLongPressInMobile: true,
    menuWrapperCss: {
        background: '#0b0b0bcc',
        borderRadius: '8px',
        padding: '5px 4px',
        boxShadow: '#00000080 0 10px 30px',
        lineColor: 'rgba(255,255,255,.1)',
        lineMargin: '5px 10px',
        backdropFilter: 'blur(10px)',
    },
    menuItemCss: {
        arrowSize: '10px',
        labelColor: '#FFF',
        hoverLabelColor: '#FFF',
        arrowColor: '#ffffff00'
    },
    menuList: [],
}

const list = async () => {

    let authPagesFlat = useAuthPagesStore().getFlat

    // 如果 authPagesFlat 为空，堵塞，等待获取权限列表
    if (utils.is.empty(authPagesFlat)) {
        await new Promise((resolve) => {
            let timer = setInterval(() => {
                authPagesFlat = useAuthPagesStore().getFlat
                if (!utils.is.empty(authPagesFlat)) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }

    // 用户的页面权限
    let pagesHash = cache.get('user-info')?.['result']?.['auth']?.['pages']?.['hash'] || ''
    // 用户权限列表
    let list = [{
        label: '创作',
        name : 'create',
        items: ['/admin/article', '/admin/article/group', '/admin/article/write', '/admin/pages','/admin/pages/write'],
        children: [],
    },{
        label: '管理',
        name : 'manage',
        items: [
            '/admin/users', '/admin/bill', '/admin/order', '/admin/comment', '/admin/placard', '/admin/banner', '/admin/tags', '/admin/badge', '/admin/level', '/admin/links',
            '/admin/links/group', '/admin/system/version', '/admin/system'
        ],
        children: [],
    },{
        label: '安全',
        name : 'security',
        items: ['/admin/auth/rules', '/admin/auth/group', '/admin/api/keys', '/admin/auth/pages', '/admin/ip/black', '/admin/qps/warn'],
        children: [],
    }]

    // 用户拥有的页面权限
    let pages = []
    // 用户拥有的接口权限
    if (utils.in.array('all', pagesHash)) {
        pages = authPagesFlat.map(item => item.path)
    } else {
        // 去重 去空
        pagesHash = [...new Set(pagesHash)].filter(item => item)
        // 从 all 中找到 hash = pagesHash 的项
        pages = authPagesFlat.filter(item => pagesHash.indexOf(item.hash) !== -1).map(item => item.path)
    }

    for (let index in list) {
        // 取 pages 和 list 的交集
        let cross = list[index].items.filter(item => pages.indexOf(item) !== -1)
        // 把交集的到的结果加上 all 二维数组继续进行补全，根据 all.map(item => item.path) 的结果
        let children = cross.map(item => authPagesFlat.find(i => i.path === item))
        // 修正 children item 的字段 label => name，fn: () => push(item.path)
        children = children.map(item => {
            item.label = item.name
            item.fn = () => push(item.path)
            return item
        })
        // 把 children 赋值给 list[index].children
        list[index].children = children
    }

    // 如果 list[index].children 为空，就删除 list[index]
    list = list.filter(item => item.children.length)

    return list
}

export { list, config }