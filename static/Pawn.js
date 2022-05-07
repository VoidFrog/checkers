//klasa pionka, razem z jej wydobywaniem przy kolizji

class Pawn {
    constructor(color, position_offset, row_number){
        //           1      2
        //color is white||black
        this.color = color

        this.material;
        this.materials;
        this.geometry;
        this.mesh;

        this.edges;
        this.line;
        this.selected = false;

        this.x; 
        this.y; 
        this.z;

        //positions in array
        this.offset = position_offset   //x 
        this.row = row_number           //y

        this.create_body()  
    }

    create_body(){
        //making colored material--------------------------
        if(this.color == 2){
            this.material = new THREE.MeshBasicMaterial({
                color: 0x323130,
                map: new THREE.TextureLoader().load('https://i.imgur.com/YM33spa.jpg?1')
            })

            this.body_color = "0x323130"
        }
        else{
            //this.color == 1 ---> color is white
            this.material = new THREE.MeshBasicMaterial({
                //color: 0xFBF6F0,
                color: 0xFFFFFF,
                map: new THREE.TextureLoader().load('https://i.imgur.com/YM33spa.jpg?1')
            })

            this.body_color = "0xFBF6F0"
        }
        //--------------------------------------------------

        //making cylinder geometry
        this.geometry = new THREE.CylinderGeometry(10, 10, 5, 30, 5)

        //making mesh from these two above
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.set_position()
    }

    set_position(){
        this.x = 20*this.offset - 70
        this.y = 10
        this.z = 20*this.row - 70

        this.mesh.position.set(this.x, this.y, this.z)
    }

    pawn_clicked_border(){
        this.edges = new THREE.EdgesGeometry( this.geometry )
        this.line = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0xCC0000 }))
        
        this.selected = true
    }

    clicked_border(){
        this.mesh.material = new THREE.MeshBasicMaterial({color: 0xCC0000})
    }

    delete_border(){
        if(this.color == 2){
            this.material = new THREE.MeshBasicMaterial({
                color: 0x323130,
                map: new THREE.TextureLoader().load('https://i.imgur.com/YM33spa.jpg?1')
            })

            this.body_color = "0x323130"
        }
        else{
            //this.color == 1 ---> color is white
            this.material = new THREE.MeshBasicMaterial({
                //color: 0xFBF6F0,
                color: 0xFFFFFF,
                map: new THREE.TextureLoader().load('https://i.imgur.com/YM33spa.jpg?1')
            })

            this.body_color = "0xFBF6F0"
        }

        this.mesh.material = this.material
    }

}