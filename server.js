let express = require('express');
let app = express()
const PORT = 3000

app.use(express.static('static'))
app.use(express.json())
app.use(express.text())




let searching_players = []
let playing_players = []
let rooms = []
//game states are full checkerboard states which contain state for every room
let game_states = []
let moved_pawn;
let move_to_x;
let move_to_z;
let to_delete = 0



app.get('/', (req, res) => {
    
    res.sendFile('index.html')
})

app.post('/search_for_player', (req, res) => {
    let data = req.body
    console.log(data, "<------this is data", JSON.stringify(data))


    //this chunk of code checks if the player_name is already registered or not
    console.log("\n",searching_players)

    let new_in_arr = true
    for(let obj of searching_players){
        if(obj.player == data.player){
            new_in_arr = false
        }
    }
    for(let obj of playing_players){
        if(obj == data.player){
            new_in_arr = false
        }
    }


    if(new_in_arr && data.player != ''){
        searching_players.push(data)
        console.log("\n",searching_players)

        data = {
            player: "player_added"
        }
    }
    else{
        if(data.player == ''){
            data.player = "blank_field"
        }
        else{
            data.player = "not_added"
        }
    }

    data = JSON.stringify(data)
    res.send(data)
})

app.post('/wait_for_player', (req, res) => {
    let data = req.body
    console.log(data)

    if(searching_players.length > 1){
        
        //removing done after game init ---> look to netcode for further explanation
        //searching_players = searching_players.filter(delete_players(nickname))
        playing_players.push(data.player)


        console.log(searching_players, "searching |||||| playing", playing_players)

        //1 is white
        //2 is black
        data.color = playing_players.length%2 + 1 

        data.started = true
        //make arr of the two playing players, and start game for them

    }
    else{
        data.started = false
    }

    res.send(data)
})

app.post('/delete_players_in_game', (req, res) => {
    let data = req.body

    console.log(data)
    to_delete += 1
    
    console.log(searching_players, playing_players)

    works = {
        deleted: "yes"
    }
    works = JSON.stringify(works)
    res.send(works)

})

app.post('/delete_user_from_server', (req, res) => {
    let data = req.body

    console.log(searching_players, "players before deletion")
    console.log('deleted user ---> ', data.username)
    

    for(let player in searching_players){
        if(searching_players[player].player == data.username){
            searching_players.splice(player, 1)
        }
    }

    console.log(searching_players, "players after deletion")

})

app.post('/send_enemy_name', (req, res) => {
    let data = req.body

    let interval = setInterval(function (){
        if(searching_players.length == 0 && playing_players.length%2 == 0){
            console.log('player searching for enemy"s name is:' + data.name)

            let enemy_index = 0;
            let enemy_name;
            let color;
            for(let index in playing_players){
                if(playing_players[index] == data.name){
                    if(index%2 == 0){
                        enemy_index = parseInt(index) + 1
                        enemy_name = playing_players[enemy_index]
                        console.log(playing_players, enemy_index, typeof(enemy_index),enemy_name)
                    }
                    else{
                        enemy_index = parseInt(index) - 1
                        enemy_name = playing_players[enemy_index]
                    }
                }
            }

            console.log('enemy"s name is:' + enemy_name)

            let enemy = {
                name: enemy_name,
            }
            enemy = JSON.stringify(enemy)
            clearInterval(interval)

            res.send(enemy)
        }
        else{
            console.log('waiting for even number of players...')
        }
    }, 200)
        
})

app.post('/send_game_state', (req, res) => {
    let data = req.body

    //add room functionality!!!!
    
    //game_states[room_number] will be prefered way
    console.log(data.game_state)
    game_states[0] = data.game_state
    moved_pawn = data.pawn_moved
    move_to_x = data.x
    move_to_z = data.z
    
    console.log(moved_pawn)

    res.send("ok")
})

app.post('/sync_game_state', (req, res) => {
    //game_states[room_number] will be prefered way

    //console.log(moved_pawn)

    let data = {
        game_state: game_states[0],
        pawn_index: moved_pawn,
        x: move_to_x,
        z: move_to_z
    }

    //console.log(data.pawn_index, "jebac disa kurwe")

    data = JSON.stringify(data)
    
    res.send(data)
})



app.listen(PORT, (req, res) => {
    console.log(`server started on PORT: ${PORT}`)
})

let delete_players = setInterval(function(){
    if(to_delete == 2){
        searching_players.splice(0, 1)
        searching_players.splice(0, 1)

        let len = playing_players.length
        let room = [playing_players[len-2], playing_players[len-1]]
        rooms.push(room)

        console.log("deleting players")
        to_delete -= 2
    }
    console.log(searching_players, "<-searching|||||playing->", playing_players, to_delete, "||||||||||||||||| rooms ->", rooms)

}, 500)


