class Net {
    constructor(){
        this.player_login = ''
        this.searching_for_player_fetch;
    }

    send_data_username(username){
        this.player_login = username.player

        const options = {
            method: "POST",
            body: JSON.stringify(username),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        //console.log(username, JSON.stringify(username))

        fetch('/search_for_player', options)
        .then(response => response.json())
        .then(data => {
            //console.log("added player ----> ", data.player )
            let info = document.getElementById('info_table')
            let search_button = document.getElementById('search_button')
            
            if(data.player == "player_added"){
                info.textContent = "Logged in successfully... Waiting for another player..."
                search_button.style.pointerEvents = "none"
                
                this.searching_for_player_fetch = setInterval(this.wait_for_second_user, 1000, this.player_login)
                //set interval to fetch --> asking for another player's readiness
            }
            else if(data.player == 'blank_field'){
                info.textContent = "Username field cannot be left blank..."
            }
            else{
                info.textContent = "Error... That username is already in use, try another one..."
            }


        })
        .catch(err => {console.log("something went wrong...", err)})

    }


    wait_for_second_user(login){
        let name = {
            player: login
        }

        const options = {
            method: "POST",
            body: JSON.stringify(name),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        console.log(name, JSON.stringify(name))

        fetch('/wait_for_player', options)
        .then(response => response.json())
        .then(data => {
            console.log("waiting ----> ", data.player, data.started )
            
            if(data.started == true){
                console.log("PLAYER WAS FOUND")

                clearInterval(net.searching_for_player_fetch)
                net.delete_users_that_found_game()

                ui.hide_menu()

                //get name of opponent
                ui.info.innerText = `USER - ${net.player_login} ----------------------- YOUR TURN - ${game.turn} \n`
                ui.info.innerText += 'Game found... Your enemy is'
                net.get_enemy_name()
                
                //start game 
                console.log(data.color)
                game.playing_color = parseInt(data.color)
                game.init()
                
                //this takes game state from server
                game.sync_data_interval = game.sync_data()
            }

        })
        .catch(err => {console.log("something went wrong...", err)})

    }

    get_enemy_name(){
        let name = {
            name: this.player_login
        }

        const options = {
            method: "POST",
            body: JSON.stringify(name),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        console.log(name, JSON.stringify(name))

        fetch('/send_enemy_name', options)
        .then(response => response.json())
        .then(data => {
            console.log("enemy is ----> ", data.name )
            ui.info.innerText += ` ${data.name}`
            net.enemy_name = data.name
            //game.playing_color = data.color

            if(data.color == 2){
                game.camera.position.z = -150
                game.camera.lookAt(game.scene.position)
            }
        })
        .catch(err => {console.log("something went wrong...", err)})
    }

    delete_users_that_found_game(){
        let name = {
            player: this.player_login
        }
        
        const options = {
            method: "POST",
            body: JSON.stringify(name),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch('/delete_players_in_game', options)
        .then(response => response.json())
        .then(data => {
            console.log("removed from search list...")
            
        })
        .catch(err => {console.log("something went wrong...", err)})


    }

    delete_username_from_server(){
        let username = {
            username: this.player_login
        }
        
        const options = {
            method: "POST",
            body: JSON.stringify(username),
            headers: {
                'Content-Type': 'application/json'
            }
        } 

        fetch('/delete_user_from_server', options)
        .then(response => response.json())
        .then(data => console.log(`player: ${net.player_login} deleted from game search list`))
        .catch(err => console.log("something went wrong...", err))

    }

    //pawn index in pawn_object_list
    send_game_state(pawn_index, x, z, row, offset, pawn_remove, is_enemy_turn){
        //sends game state after your move
        let data = {
            game_state: game.pawns,
            pawn_moved: pawn_index,
            x: x,
            z: z,
            row: row,
            offset: offset,
            pawn_remove: pawn_remove,
            is_enemy_turn: !game.turn
            //before this make setting game.room
            //room_number: game.room
        }

        console.log(data.pawn_moved, game.selected_pawn_index, data.is_enemy_turn, game.turn, is_enemy_turn)

        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch('/send_game_state', options)
        .then(response => response.json())
        .then(data => {
            console.log("move made... data was send to server", data)

        })
        .catch(error => console.log(error))
    }

    sync_game_state(){
        //syncs game every few seconds 
        let data = {
            body: "data was sent"
        }

        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch('/sync_game_state', options)
        .then(response => response.json())
        .then(data => {

            ui.info.innerText = `USER - ${net.player_login} ----------------------- YOUR TURN - ${game.turn} \n`
            ui.info.innerText += `Game found... Your enemy is ${net.enemy_name}`

            if(game.pawns != data.game_state && data.pawn_index != undefined){
                game.pawns = data.game_state
                
                //console.log(data.game_state, data.x, data.z, data.pawn_index)
                
                game.pawn_object_list[data.pawn_index].row = data.row
                game.pawn_object_list[data.pawn_index].offset = data.offset
                
                new TWEEN.Tween(game.pawn_object_list[data.pawn_index].mesh.position)
                        .to({x: data.x, z: data.z}, 500)
                        .repeat(0)
                        .easing(TWEEN.Easing.Bounce.Out)
                        .onUpdate(() => {
                            //console.log(animated_pawn.position) 
                        })
                        .onComplete(() => {
                            console.log("animation ended", data.pawn_remove)
                        })
                        .start()

                if(data.pawn_remove != null){
                    //console.log("nl", data.pawn_remove)
                    for(let pwn of game.pawn_object_list){
                        //console.log(pwn, data.pawn_remove, "qq")
                        if(pwn.offset == data.pawn_remove.offset && pwn.row == data.pawn_remove.row){
                            //console.log("bruh")
                            pwn.mesh.position.z = 1000
                            pwn.mesh.position.x = 1000
                            game.destroyed_pawns.push(pwn)
                            game.scene.remove(pwn.mesh)
                            
                            //let index = game.pawn_object_list.indexOf(pwn)
                            //game.pawn_object_list[index] = null

                            data.pawn_remove = null
                            break
                        }
                    }
                }

                //console.log(data.is_enemy_turn, "turn info", game.turn)
                if(game.playing_color == 1){
                    if(data.is_enemy_turn%2 == 0){
                        if(game.turn != true){
                            ui.reset_timer()
                            ui.start_clock()
                        }
                        game.turn = true
                        
                    }
                    else {
                        game.turn = false
                        clearInterval(ui.clock_tick)
                        ui.clock.textContent = '----'

                        for(let tl of game.surrounding_tiles){
                            tl.delete_border()
                        }
                        for(let pn of game.surrounding_pawns){
                            pn.delete_border()
                        }
                        if(game.selected_pawn != null){
                            if(game.selected_pawn.line != null){
                                game.scene.remove(game.selected_pawn.line)
                            }
                        }
                        game.check_win_condition(game.selected_pawn)
                        game.player_lost(game.selected_pawn)
                        game.selected_pawn = null
                    }
                }
                else if(game.playing_color == 2){
                    if(data.is_enemy_turn%2 == 1){                        
                        if(game.turn != true){
                            ui.reset_timer()
                            ui.start_clock()
                        }
                        game.turn = true
                    }
                    else{
                        game.turn = false
                        clearInterval(ui.clock_tick)
                        ui.clock.textContent = '----'

                        for(let tl of game.surrounding_tiles){
                            tl.delete_border()
                        }
                        for(let pn of game.surrounding_pawns){
                            pn.delete_border()
                        }
                        if(game.selected_pawn != null){
                            if(game.selected_pawn.line != null){
                                game.scene.remove(game.selected_pawn.line)
                            }
                        }
                        game.check_win_condition(game.selected_pawn)
                        game.player_lost(game.selected_pawn)
                        game.selected_pawn = null

                    }
                }

                
                
            }

            else if(game.playing_color == 1){
                if(data.is_enemy_turn%2 == 0){
                    if(game.turn != true){
                        ui.reset_timer()
                        ui.start_clock()
                    }
                    game.turn = true
                    game.check_win_condition(game.selected_pawn)
                    game.player_lost(game.selected_pawn)
                    
                }
                else {
                    game.turn = false
                    clearInterval(ui.clock_tick)
                    ui.clock.textContent = '----'

                    for(let tl of game.surrounding_tiles){
                        tl.delete_border()
                    }
                    for(let pn of game.surrounding_pawns){
                        pn.delete_border()
                    }
                    if(game.selected_pawn != null){
                        if(game.selected_pawn.line != null){
                            game.scene.remove(game.selected_pawn.line)
                        }
                    }

                    game.check_win_condition(game.selected_pawn)
                    game.player_lost(game.selected_pawn)
                    game.selected_pawn = null
                }
            }
            else if(game.playing_color == 2){
                if(data.is_enemy_turn%2 == 1){                        
                    if(game.turn != true){
                        ui.reset_timer()
                        ui.start_clock()
                    }
                    game.turn = true
                    game.check_win_condition(game.selected_pawn)
                    game.player_lost(game.selected_pawn)
                }
                else{
                    game.turn = false
                    clearInterval(ui.clock_tick)
                    ui.clock.textContent = '----'

                    for(let tl of game.surrounding_tiles){
                        tl.delete_border()
                    }
                    for(let pn of game.surrounding_pawns){
                        pn.delete_border()
                    }
                    if(game.selected_pawn != null){
                        if(game.selected_pawn.line != null){
                            game.scene.remove(game.selected_pawn.line)
                        }
                    }

                    game.check_win_condition(game.selected_pawn)
                    game.player_lost(game.selected_pawn)
                    game.selected_pawn = null

                }
            }

            if(data.pawn_remove != null){
                //console.log("nl", data.pawn_remove)
                for(let pwn of game.pawn_object_list){
                    //console.log(pwn, data.pawn_remove, "qq")
                    if(pwn.offset == data.pawn_remove.offset && pwn.row == data.pawn_remove.row){
                        //console.log("bruh")
                        pwn.mesh.position.z = 1000
                        pwn.mesh.position.x = 1000
                        game.destroyed_pawns.push(pwn)
                        game.scene.remove(pwn.mesh)
                        
                        //let index = game.pawn_object_list.indexOf(pwn)
                        //game.pawn_object_list[index] = null

                        data.pawn_remove = null
                        break
                    }
                }
            }
        })
        .catch(error => console.log(error))
    }

    pass_turn(){
        //sends game state after your move
        let data = {
            is_enemy_turn: !game.turn
            //before this make setting game.room
            //room_number: game.room
        }

        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch('/pass_turn', options)
        .then(response => response.json())
        .then(data => {
            console.log("turn passed due to end of time for the turn", data)

        })
        .catch(error => console.log(error))
    }
}
