//klasa pola szachownicy, wraz z wydobywaniem jej obiektu przy kolizji 

class CheckerboardTile {
    constructor(color, position_offset, row_number){
        //           0      1
        //color is beige||black
        this.color = color

        this.material;
        this.geometry;
        this.mesh;

        this.x; 
        this.y; 
        this.z;

        //positions in array 
        this.offset = position_offset   //x
        this.row = row_number           //y

        this.create_body()  
    }

    create_body(){
        //making colored material---------------------------
        if(this.color == 0){
            this.material = new THREE.MeshBasicMaterial({
                //beige
                color: 0x2E1807
            })
        }
        else{
            this.material = new THREE.MeshBasicMaterial({
                //black
                color: 0xE0AC69
            })
        }
        //--------------------------------------------------

        //making box shape geometry
        this.geometry = new THREE.BoxGeometry(20, 10, 20)

        //making mesh element
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.set_position()
        this.click_listener()
    }

    set_position(){
        this.x = 20*this.offset - 70
        this.y = 0
        this.z = 20*this.row - 70

        this.mesh.position.set(this.x, this.y, this.z)
    }

    click_listener(){
        //add colision detection
    }
}