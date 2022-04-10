class Game {
    constructor(){

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000)
        this.renderer = new THREE.WebGLRenderer()

        this.axes = new THREE.AxesHelper(2000)
        this.scene.add(this.axes)

        this.renderer.setClearColor(0x014359)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.getElementById('root').appendChild(this.renderer.domElement)

        this.camera.position.set(0, 200, 150)
        this.camera.lookAt(this.scene.position)

        //raycaster elements
        this.raycaster = new THREE.Raycaster()
        this.mouseVector = new THREE.Vector2()

        //selected pawn
        this.selected_pawn = null;
        this.selected_pawn_index;
        this.playing_color;

        this.sync_data_interval;

        this.resize_handler();
        this.render()

        //creating checkerboard array and it's representation on screen
        this.checkerboard_tiles = []
        this.checkerboard = this.create_checkerboard()
        this.render_checkerboard()
        
    }

    render = () => {
        
        TWEEN.update()
        requestAnimationFrame(this.render)
        this.renderer.render(this.scene, this.camera)
        console.log('rendering in progress...')
    }

    init(){
        //creating pawns and their representations on checkerboard
        this.pawn_object_list = []
        this.pawns = this.create_pawns_table()

        net.send_game_state()
        
        if(this.playing_color == 2){
            //move player to his side if his pawns are black
            this.camera.position.z = -150
            this.camera.lookAt(this.scene.position)
        }
        
        this.create_pawns()

        //adds raycaster
        this.add_mouse_listener()
    }

    add_mouse_listener(){
        //binding context
        let _this = this

        document.addEventListener('click', function(e){
            _this.mouseVector.x = (e.clientX / window.innerWidth)*2 - 1
            _this.mouseVector.y = -(e.clientY / window.innerHeight)*2 + 1 

            _this.raycaster.setFromCamera(_this.mouseVector, _this.camera)
            _this.intersects = _this.raycaster.intersectObjects(_this.scene.children)
            
            //this is the first clicked item including checkerboard
            //console.log(_this.intersects.length, _this.intersects[0])

            _this.pawn_collision()
            _this.move_pawn()

        })
    }

    sync_data(){        
        console.log("cum")
        return setInterval(net.sync_game_state, 1000)
    }

    pawn_collision(){
        for(let pawn of this.pawn_object_list){
            if(this.intersects[0]){
                if(this.intersects[0].object.position == pawn.mesh.position && (this.intersects[0].object.position.x % 10 == 0 && this.intersects[0].object.position.z % 10 == 0)){
                    for(let pawn of this.pawn_object_list){
                        this.scene.remove(pawn.line)
                        pawn.selected = false
                    }

                    for(let index in this.pawn_object_list){
                        if(this.pawn_object_list[index].mesh.position == pawn.mesh.position){
                            this.selected_pawn_index = parseInt(index)
                            console.log(index, "to jest ten")
                        }
                    }
    
                    pawn.pawn_clicked_border()
                    
                    pawn.line.position.set(pawn.mesh.position.x, pawn.mesh.position.y, pawn.mesh.position.z)
                    this.scene.add(pawn.line)
                    
                    pawn.selected = true
                    this.selected_pawn = pawn
    
                    console.log(pawn.mesh, pawn.offset, pawn.row, pawn.color)
                }
            }  
        }
    }

    move_pawn(){
        if(this.selected_pawn != null){
            for(let tile of this.checkerboard_tiles){
                if(this.intersects[0].object.position == tile.mesh.position){
                    let z = this.intersects[0].object.position.z
                    let x = this.intersects[0].object.position.x
                    
                    //tile arr placement
                    let tile_x = tile.offset
                    let tile_y = tile.row

                    //pawn arr placement
                    let arr_x = this.selected_pawn.offset
                    let arr_y = this.selected_pawn.row

                    //deletes the moved pawn position from this place
                    this.pawns[arr_y][arr_x] = 0
                    //sets new position of moved pawn in arr
                    this.pawns[tile_y][tile_x] = this.selected_pawn.color

                    console.log(this.selected_pawn_index, 'pierdolenie w chuja')
                    net.send_game_state(this.selected_pawn_index, x, z)
                    

                    let animated_pawn = this.selected_pawn.mesh

                    this.scene.remove(this.selected_pawn.line)

                    new TWEEN.Tween(animated_pawn.position)
                        .to({x: x, z: z}, 500)
                        .repeat(0)
                        .easing(TWEEN.Easing.Bounce.Out)
                        .onUpdate(() => {
                            //console.log(animated_pawn.position) 
                        })
                        .onComplete(() => {console.log("animation ended")})
                        .start()

                    //this.selected_pawn.mesh.position.x = x
                    //this.selected_pawn.mesh.position.z = z

                    this.selected_pawn = null
                    
                }
            }
        }
    }

    is_pawn_here(tile, white, row){
        let is_pawn

        if(row%2 == 0){
            if(tile%2 == 0){
                is_pawn = 2 - white
            }
            else{
                is_pawn = 0
            }
        }
        else{
            if(tile%2 == 1){
                is_pawn = 2 - white
            }
            else{
                is_pawn = 0
            }
        }
        
        
        
        return is_pawn
    }

    create_pawns_table(){      
        let pawns = []

        for(let row = 0; row < 8; row++){
            
            let pawns_on_row = []
            for(let tile = 0; tile < 8; tile++){
                
                let pawn;
                if(row == 0 || row == 1){
                    //2 if there is black pawn
                    
                    pawn = this.is_pawn_here(tile, 0, row)
                    pawns_on_row.push(pawn)
                }
                else if(row == 6 || row == 7){
                    pawn = this.is_pawn_here(tile, 1, row)
                    pawns_on_row.push(pawn)
                }
                else{
                    pawn = 0 
                    pawns_on_row.push(pawn)
                }
            }

            pawns.push(pawns_on_row)
        }

        return pawns
    }

    create_pawns(){
        let row_iterator = 0
        let tile_iterator;

        for(let row of this.pawns){
            tile_iterator = 0

            for(let tile of row){
                let color = tile;
                //1 -- white
                //2 -- black

                if(color == 0){
                    tile_iterator += 1
                    continue
                }

                //tile iterator is tile offset and row iterator is row number
                let pawn = new Pawn(color, tile_iterator, row_iterator)
                this.pawn_object_list.push(pawn)
                tile_iterator += 1

                this.scene.add(pawn.mesh)
            }

            row_iterator += 1
        }
    }

    render_pawns(){
        let row_iterator = 0
        let tile_iterator;

        for(let row of this.pawns){
            tile_iterator = 0

            for(let tile of row){
                let color = tile;
                //1 -- white
                //2 -- black

                if(color == 0){
                    tile_iterator += 1
                    continue
                }

                //tile iterator is tile offset and row iterator is row number
                this.pawn_object_list[row_iterator][tile_iterator].mesh.position.set(20*tile_iterator - 70, 10, 20*row_iterator - 70)
                
                tile_iterator += 1

            }

            row_iterator += 1
        }
    }

    render_checkerboard(){
        let row_iterator = 0
        let tile_iterator;

        for(let row of this.checkerboard){
            tile_iterator = 0

            for(let tile of row){
                let color = tile;
                let checkerboard_tile = new CheckerboardTile(color, tile_iterator, row_iterator)
                
                this.checkerboard_tiles.push(checkerboard_tile)
                this.scene.add(checkerboard_tile.mesh)

                tile_iterator += 1
            }
            row_iterator += 1
        }
    }

    create_checkerboard(){
        // 0 to będzie czarny
        let starting_color_offset = 0
        let whole_checkerboard = []
        

        for(let row = 0; row < 8; row++){
            
            let checkerboard_row = []
            for(let tile = 0; tile < 8; tile++){
                
                //tile%2 daje 0 albo 1 na zmianę
                let checkerboard_tile = (tile + starting_color_offset)%2
                checkerboard_row.push(checkerboard_tile)
            }

            starting_color_offset = this.change_color_offset(starting_color_offset)
            whole_checkerboard.push(checkerboard_row)
        }

        return whole_checkerboard
    }

    change_color_offset(color_offset){
        if(color_offset == 0){
            color_offset = 1
        }
        else{
            color_offset = 0
        } 
        return color_offset
    }

    resize_handler(){
        
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.camera.aspect = window.innerWidth/window.innerHeight
            this.camera.updateProjectionMatrix()
        })
    }


}