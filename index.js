const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

/* PRIVACY SETTINGS SET = ADD CHAT FALSE */

const token = '5167511230:YOUR_TOKEN'

const bot = new TelegramBot(token, {polling: true})

var telegramChannels = [
    {id: 1, link: "https://t.me/channel_name", name: "СЛИВ +18", about: "Сливы девушек и женщин"}
]

var groupsVK = [
    {id: 1, link: "https://vk.com/vkgroupid", name: "СЛИВ +18", about: "Сливы девушек и женщин"}
]

const ADMIN_ID_TG = -1 // here set admin id for forward message

var users = []

function returnMain() {
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Вернуться в главное меню', callback_data: JSON.stringify({route: 'return', data: null}) }]
            ]
        })
    }
    return options
}

function welcomeStart(chatId, first = false, from = []) {
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Предложить материал', callback_data: JSON.stringify({route: 'material_1', data: null}) }],
                [{ text: 'Просмотреть каналы и группы', callback_data: JSON.stringify({route: 'show_groups', data: null}) }]
            ]
        })
    }
    let welcomeMessage = (first) ? `Привет ${from.first_name} ${from.last_name}, это бот, который с радостью примет твой контент и выложит его в наши каналы и группы!` : `Так, но мы уже с тобой знакомы. Какое действие желаешь выбрать?`
    bot.sendMessage(chatId, welcomeMessage, options);
}

async function sessionTellarion(userId) {
    return new Promise((resolve) => {
        if(typeof(users[userId]) == 'undefined') {
            users[userId] = {}
            users[userId].id = userId
            users[userId].auth = true
            users[userId].content = -1
            users[userId].files = 0
            users[userId].filesMessage = false
            console.log(users[userId])
            console.log('save session')
            resolve(false)
        } else {
            resolve(true)
        }
    })
}

function getFolderNameTg(content) {
    switch(content) {
        case 1: return "Sliv";
        default: return "Unknown";
    }
}

bot.onText(/\/start/, (msg, match) => {
    sessionTellarion(msg.from.id).then(auth => {
        const chatId = msg.chat.id
        let from = msg.from
        welcomeStart(chatId, true, from)
    })
})

bot.on('message', (msg) => {

    if(msg.text != "/start") {
        sessionTellarion(msg.from.id).then(auth => {

            if(auth) {

                let contentUser = users[msg.from.id].content

                var options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{ text: 'Опубликовать!', callback_data: JSON.stringify({route: 'done', data: null}) }]
                        ]
                    })
                }

                if(contentUser != -1) {
                    if(typeof(msg.photo) != "undefined") {
                        // 3 = full size

                        let tempSliv = getFolderNameTg(users[msg.from.id].content)
                        
                        var dirSave = `./download/${tempSliv}`;

                        if (!fs.existsSync(dirSave)){
                            fs.mkdirSync(dirSave)
                        }

                        if (!fs.existsSync(dirSave + "/photos")){
                            fs.mkdirSync(dirSave + "/photos")
                        }

                        if (!fs.existsSync(dirSave + "/videos")){
                            fs.mkdirSync(dirSave + "/videos")
                        }

                        let photoID = (typeof(msg.photo[3]) != 'undefined') ? msg.photo[3].file_id : (typeof(msg.photo[2]) != 'undefined') ? msg.photo[2].file_id : msg.photo[1].file_id

                        bot.downloadFile(photoID, `${dirSave}/photos`).then(result => {
                            users[msg.from.id].files = users[msg.from.id].files + 1
                            console.log(`Photo ${result} success download`)
                            if(users[msg.from.id].content != -1 && users[msg.from.id].files >= 1 && users[msg.from.id].filesMessage == false) {
                                users[msg.from.id].filesMessage = true,
                                bot.sendMessage(msg.chat.id, `Бот получил твои материалы. Нажми теперь "Опубликовать"`, options);
                            }
                        })
                    }
                
                    if(typeof(msg.video) != "undefined") {
                        bot.downloadFile(msg.video.file_id, `${dirSave}/videos`).then(result => {
                            users[msg.from.id].files = users[msg.from.id].files + 1
                            console.log(`Video ${result} success download`)
                            if(users[msg.from.id].content != -1 && users[msg.from.id].files >= 1 && users[msg.from.id].filesMessage == false) {
                                users[msg.from.id].filesMessage = true
                                bot.sendMessage(msg.chat.id, `Бот получил твои материалы. Нажми теперь "Опубликовать"`, options);
                            }
                        })
                    }
                } else {
                    bot.sendMessage(msg.chat.id, "Загрузка файлов таким образом невозможна. Сначала необходимо выбрать группу для залива, а потом уже прикреплять контент.")
                    welcomeStart(msg.chat.id, false, msg.from)
                }
            } else {
                bot.sendMessage(msg.chat.id, "Приносим свои извинения. Вероятно бот был перезапущен из-за технической ошибки. Попробуйте вновь.")
                welcomeStart(msg.chat.id, true, msg.from)
            }
    
        })
    }

})

bot.on('callback_query', function onCallbackQuery(callbackQuery) {

    const action = JSON.parse(callbackQuery.data)

    const msg = callbackQuery.message

    sessionTellarion(msg.chat.id).then(auth => {

        if(auth) {
          
            if(typeof(action.route) != 'undefined') {
        
                if(action.route == "material_1") {
                    let board_groups = []
        
                    telegramChannels.forEach(element => {
                        board_groups.push({ text: `${element.name}`, callback_data: JSON.stringify({route: 'material_2', data: element.id})})
                    })
                    
                    var options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                board_groups,
                                [{ text: 'Назад', callback_data: JSON.stringify({route: 'return', data: null}) }]
                            ]
                        })
                    }
                    bot.sendMessage(msg.chat.id, `Теперь нужно выбрать канал, куда будет идти публикация`, options)
                }
        
                if(action.route == "material_2") {
                    let contentReady = action.data
                    users[msg.chat.id].content = contentReady
                    bot.sendMessage(msg.chat.id, `Теперь отправь содержимое для слива (можешь написать еще текст в публикацию).\nМожно прикреплять фотографии и видео материалы. Как скинешь все содержимое, нажми "Опубликовать"`)
                }

                if(action.route == "done") {

                    bot.sendMessage(msg.chat.id, `Спасибо большое за поддержку контента!\nСПАСИБО, СПАСИБО, СПАСИБО!\nАнонимность при публикации: Да (скоро можно будет инициалы)\nВы отправили нам материалов ${users[msg.chat.id].files} шт.\n\nУ нас есть свой чат: https://t.me/znakomstvachat18plus`, options)
                    welcomeStart(msg.chat.id, false)
                    users[msg.chat.id].filesMessage = false
                    users[msg.chat.id].content = -1
                    users[msg.chat.id].files = 0

                    bot.sendMessage(ADMIN_ID_TG, `Пришел новый контент! Посмотри от ${users[msg.chat.id].id}`)
                    bot.forwardMessage(ADMIN_ID_TG, msg.chat.id, msg.message_id-1)

                }
                
            
                if(action.route == "show_groups") {
        
                    let optionsMain = returnMain()
        
        
                    let groupsTplTg = ``
                    telegramChannels.forEach(element => {
                        groupsTplTg += `[${element.name}] => LINK: ${element.link}\n`
                    })
        
                    let groupsTplVK = ``
                    groupsVK.forEach(element => {
                        groupsTplVK += `[${element.name}] => LINK: ${element.link}\n`
                    })
        
                    bot.sendMessage(msg.chat.id, `Список доступных сообществ [Telegram]\n\n${groupsTplTg}\n\nСписок доступных сообществ [VK]\n${groupsTplVK}`, optionsMain)
        
                }
        
                if(action.route == "return") {
                    welcomeStart(msg.chat.id, false)
                }
        
                if(action.route != null) {
                    console.log('удалено')
                    bot.deleteMessage(msg.chat.id, msg.message_id)
                }

                console.log(`CONTENT: ${users[msg.chat.id].content}; FILES: ${users[msg.chat.id].files}`)
        
            }

        } else {
            bot.sendMessage(msg.chat.id, "Приносим свои извинения. Вероятно бот был перезапущен из-за технической ошибки. Попробуйте вновь.")
            welcomeStart(msg.chat.id, true, msg.chat)
        }
    })

});