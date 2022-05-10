class  Ui {
    constructor(){
        this.input = document.getElementById('username_input')
        this.reset = document.getElementById('reset_button')
        this.search_game = document.getElementById('search_button')
        this.info = document.getElementById('info_table')
        this.menu = document.getElementById('menu')
        this.clock = document.getElementById('clock')

        this.add_event_listeners()
    }

    add_event_listeners(){
        this.clock.style.zIndex = "10000"

        this.reset.addEventListener('click', () => {
            this.input.value = ""
            this.search_game.style.pointerEvents = "auto"
            this.info.textContent = "Username reseted... Searching stopped..."
            clearInterval(net.searching_for_player_fetch)
            //add removing fetch inteval - done ^^

            //delete this user from server 
            console.log(net.player_login, "is current player login ----> to delete on server")
            net.delete_username_from_server()
        })
        
        
        this.search_game.addEventListener('click', () => {
            let username = this.input.value

            let player_obj = {
                "player": username
            }

        
            net.send_data_username(player_obj)
        })
    }

    hide_menu(){
        this.menu.style.display = 'none'
    }

    start_clock(){
        let first_tick_milliseconds = Date.now() + 30000
        this.clock_tick = setInterval(this.time_passed, 500, first_tick_milliseconds)
    }

    reset_timer(){
        clearInterval(this.clock_tick)
    }

    time_passed(first_tick_milliseconds){
        let now = Date.now()
    
        //time since start in milliseconds
        let delta_time = first_tick_milliseconds - now
    
        let seconds = Math.floor(delta_time/1000)    
        this.clock.textContent = seconds 

        //niezbyt dziala || dobra jednak żart bo działa XD 
        if(seconds == 0){
            clearInterval(this.clock_tick)
            game.turn = false
            
            if(this.clock_tick == null){
                net.pass_turn()
            }
            this.clock.textContent = '----'
        }
    }

}




