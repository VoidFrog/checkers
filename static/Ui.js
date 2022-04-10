class  Ui {
    constructor(){
        this.input = document.getElementById('username_input')
        this.reset = document.getElementById('reset_button')
        this.search_game = document.getElementById('search_button')
        this.info = document.getElementById('info_table')
        this.menu = document.getElementById('menu')

        this.add_event_listeners()
    }

    add_event_listeners(){
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
}




