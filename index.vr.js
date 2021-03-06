import React from 'react';
import {
  AppRegistry,
  asset,
  StyleSheet,
  Pano,
  Text,
  View,
  VrButton,
  NativeModules,
  Mesh,
  PointLight
} from 'react-vr';

  
class vrGame extends React.Component {
  constructor() {
    super();
    this.state = {
      positionAdd: 0,
      levelMultiplier: 1,
      rotate: 0,
      enemies: [],
      crazy: false,
      timer: 0,
      speedMultiplier: 1,
      score: 0,
      timeGame: false,
      show: 0,
      showAll: 0,
      started: 1
    };
    // Used for timing length of game
    this.timeOfGame = Date.now();
    this.endOfGame = 0;
    
    // Helpers for timing and rotation
    this.lastUpdate = Date.now();
    this.enterUpdate = null;
    this.rotateUpdate = Date.now();
    
    // Crate movement
    this.move = this.move.bind(this);
    this.rotate = this.rotate.bind(this);
    
    // Crate (enemy) creation
    this.createEnemies = this.createEnemies.bind(this);
    this.deleteEnemies = this.deleteEnemies.bind(this);
    
    // Enemy destruction
    this.kill = this.kill.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    
    // Level changes
    this.increaseLevel = this.increaseLevel.bind(this);
    this.decreaseLevel = this.decreaseLevel.bind(this);
    
    // Speed changes
    this.increaseSpeed = this.increaseSpeed.bind(this);
    this.decreaseSpeed = this.decreaseSpeed.bind(this);

    // Changes game type
    this.changeGameType = this.changeGameType.bind(this);

    // Toggle score text 
    this.toggleScore = this.toggleScore.bind(this);

    // Start the app
    this.start = this.start.bind(this);
  }

// FOR START BUTTON, CREATION OF ENEMIES
  
  createEnemies() {
    this.deleteEnemies()
    this.timeOfGame = Date.now()
      let numOfEnemies = 10 * (this.state.levelMultiplier / 2)
      let enemiesArr = []
      for (var i = 0; i < numOfEnemies; i++) {
        if (!this.state.timeGame) {
          let x = (Math.random() < 0.5) ? (Math.floor(Math.random()*10)) : Math.floor(Math.random()*-10);
          let y = (Math.random() < 0.5) ? (Math.floor(Math.random()*5)) : Math.floor(Math.random()*-5);
          let z = Math.floor(Math.random()* -200) - 100
          enemiesArr.push([x,y,z])
        }
        else if (this.state.timeGame)  { //Extraneous check to make sure this.state.timeGame is in fact 'true'
          let x = (Math.random() < 0.5) ? (Math.floor(Math.random()*10)) : Math.floor(Math.random()*-10);
          let y = (Math.random() < 0.5) ? (Math.floor(Math.random()*5)) : Math.floor(Math.random()*-5);
          let z = Math.floor(Math.random()*1) - 40 //THIS LINE WAS FOR TESTING DESTRUCTION OF ELEMENTS, NOW USED FOR TIME GAME
          enemiesArr.push([x,y,z])
        }
      }
    this.setState({enemies: enemiesArr, score: 0})
    this.move()
  }

// FOR STOP BUTTON AND FOR RESETTING GAME, DELETION OF ALL ENEMIES

  deleteEnemies() {
    this.setState({enemies: []})
    this.setState({positionAdd: 0, show: 0})
    this.lastUpdate = Date.now()
  }

// FOR CRATE MOVEMENT, MOVES THEM FORWARD, THE CHANGE DIVISOR CONTROLS THE RATE AT WHICH THEY MOVE

  move() {
    const now = Date.now();
    const change = now - this.lastUpdate;
    // this.lastUpdate = now;

    this.setState({positionAdd: this.state.positionAdd + change/200});
    this.frameHandleMove = requestAnimationFrame(this.move);
  }

// SAME AS MOVE, EXCEPT FOR ROTATION

  rotate() {
    if (this.state.rotate === 180) this.setState({rotate: 0})
    this.setState({rotate: this.state.rotate + 20});
    this.frameHandleRotate = requestAnimationFrame(this.rotate)
  }

// EXTRA CRAZY ROTATION, CONTINUALLY GETS LARGER WITHOUT RESETTING, CAUSING EXTRA LARGE ROTATION

  crayRotate() {
    const now = Date.now();
    const change = now - this.rotateUpdate
    this.rotateUpdate = now;
    // change divisor is speed constant
    this.setState({rotate: this.state.rotate + change});
    this.frameHandleRotate = requestAnimationFrame(this.crayRotate)
  }

// FUNCTION FOR 'KILLING' CRATE

  kill(id) {
    const entered = Date.now()
    if (!this.enterUpdate) this.enterUpdate = Date.now();
    const change = entered - this.enterUpdate;
    if (change > 500) {
      var newArr = this.state.enemies.slice()
      newArr.splice(id,1)
      this.setState({enemies: newArr})
      this.setState({score: this.state.score + 1})
    }
    if(this.state.enemies.length === 1) {
      this.setState({show: 1})
      this.endOfGame = Date.now()
    }
  }

// FUNCTION FOR RESETTING KILL TIMER (EXCEPT NOT USED AS OF NOW, LEFT IN FOR POSSIBLE USE LATER)

  resetTimer() {
    this.setState({timer: 0})
  }

// CHANGES LEVEL (MULTIPLIER FOR # OF CRATES SPAWNED)

  increaseLevel() {
    if (this.state.levelMultiplier === 10) return;
    this.setState({levelMultiplier: this.state.levelMultiplier+1})
  }
  
// OPPOSITE OF increaseLevel()

  decreaseLevel() {
    if (this.state.levelMultiplier === 1) return;
    else this.setState({levelMultiplier: this.state.levelMultiplier-1})
  }

// CHANGES SPEED (MULTIPLIER FOR RATE OF move())

  increaseSpeed() {
    if (this.state.speedMultiplier === 20) return;
    this.setState({speedMultiplier: this.state.speedMultiplier+1})
  }

// OPPOSITE OF increaseSpeed()
  
  decreaseSpeed() {
    if (this.state.speedMultiplier === 1) return;
    else this.setState({speedMultiplier: this.state.speedMultiplier-1})
  }

// CHANGES GAME TYPE

  changeGameType() {
    this.setState({timeGame: !this.state.timeGame})
  }

// TOGGLE SCORE AND TIME
  
  toggleScore() {
    if (this.state.show === 0) this.setState({show: 1})
    else this.setState({show: 0})
  }

// START APP AND SHOW ALL COMPONENTS AND HIDE START COMPONENT

start() {
  this.setState({showAll: 1, started: 0})
}

// FOR WHEN COMPONENT MOUNTS (left blank for now)

  componentDidMount() {
 
  }

// TO PREVENT ERRORS AFTER COMPONENT UNMOUNTS (does not unmount for now, entire app is one component with children inside of it)

  componentWillUnmount() {
    if (this.frameHandleMove) {
      cancelAnimationFrame(this.frameHandleMove);
      this.frameHandleMove = null;
    }
    if (this.frameHandleRotate) {
      cancelAnimationFrame(this.frameHandleRotate);
      this.frameHandleRotate = null;
    }
    if (this.frameHandleKill) {
      cancelAnimationFrame(this.frameHandleKill);
      this.frameHandleKill = null;
    }

  }

  render() {
  
    return (
      // APP VIEW
      <View
        style={{
          transform: [{translate: [0,0,-3]}],
          layoutOrigin: [0.5,0,0],
          alignItems: 'center',
        }}> 
        {/*APP PANO aka static background, does not create actual 3D world (world with floor, ceiling, etc), but loads 3D image */}
        <Pano source={asset('chess-world.jpg')}/>
        { //MAP FUNCTION TO DYNAMICALLY CREATE CRATES
          this.state.enemies.map((coords) =>  
            { 
              let id = this.state.enemies.indexOf(coords)
              let craziness, movement;
              // for nuts rotation around x-axis, need to make button to toggle the crayRotate func
              if (this.state.crazy) 
                craziness = this.state.rotate;
              else craziness = 0;
              // for if the crates should move
              if (!this.state.timeGame) movement = -this.state.positionAdd/(50/this.state.speedMultiplier)
              else movement = 0 
              
              return (
                <Mesh  key={id} id={id} style={{
                  transform: [
                    {translate: [...coords]},
                    {scale: 2},
                    {rotateY: 180},
                    {rotateX: craziness},
                    {translateZ: movement }
                    ]
                  }}
                  source={{mesh:asset('Crate/Crate1.obj'), texture:asset('Crate/crate_1.jpg')}}
                  onEnter={() => { this.kill(id) }}
                  // onMouseExit unused for now
                  onExit={() => {this.resetTimer() }}
                />
              
            )})
        }

        <Text style={{
          fontSize: 7 * this.state.started,
          // backgroundColor: 'red',
          transform: [
            {translate: [0, 5, -30]}
          ]
        }}>
          OH-CRATE
        </Text>
        
        <Text style={{
          fontSize: 1 * this.state.started,
          transform: [
            {translate: [0, 1, -10]}
          ]
        }}
        onEnter={() => this.start()}
        >
          START
        </Text>

        <Text style={{
          fontSize: this.state.show*2,
          margin: 0,
          padding: 0,
          transform: [
            {translate: [0, 2, -30]}
          ]
        }}>
          Score: {this.state.score} Time: {(this.endOfGame - this.timeOfGame)/1000}s
        </Text>
            
        {/*Add simple lighting*/}
        <PointLight style={{color:'white', transform:[{translate:[0,40,700]}]}} />
        {/*View for START STOP buttons, flexDirection is similar to "class = 'row'" in bootstrap*/}
        <View style={{
          flexDirection: 'row',
          margin: 0,
          padding: 0,
          transform: [{translateY: -1}]
        }}>
          <VrButton>
            <Text style={{
              fontSize: 1 * this.state.showAll,
              // paddingTop: 0.025,
              // paddingBottom: 0.025,
              // paddingLeft: 0.05,
              // paddingRight: 0.15,
              textAlign:'center',
              textAlignVertical:'center',
              transform: [
                {translate: [-1,0,0]},
                {rotateX: -75}
              ]
            }}
            onEnter={()=> {this.createEnemies()}}
            >
            START
            </Text>
          </VrButton>

          <VrButton>
            <Text style={{
              fontSize: 1 * this.state.showAll,
              // paddingTop: 0.025,
              // paddingBottom: 0.025,
              // paddingLeft: 0.05,
              // paddingRight: 0.15,
              textAlign:'center',
              textAlignVertical:'center',
              transform: [
                {translate: [1,0,0]},
                {rotateX: -75}
              ]
            }}
            onEnter={()=> {this.deleteEnemies()}}
            >
            STOP
            </Text>
          </VrButton>
        </View>
      {/*View for Level and Speed buttons, flexDirection is similar to "class = 'row'" in bootstrap*/}
       <View 
        style = {{
          flexDirection: 'row',
          transform: [{translate: [0, -1, 0]}]
        }}>
          <Text style={{
            fontSize: 0.8 * this.state.showAll,
            paddingTop: 0.025,
            paddingBottom: 0.025,
            paddingLeft: 0.05,
            paddingRight: 0.05,
            textAlign:'center',
            textAlignVertical:'center',
            transform: [
              {translate: [-1,-1,0]},
              {rotateX: -75}
            ]
          }}>
          LEVEL: {this.state.levelMultiplier}      
          </Text>
          <Text style={{
            fontSize: 0.8 * this.state.showAll,
            paddingTop: 0.025,
            paddingBottom: 0.025,
            paddingLeft: 0.05,
            paddingRight: 0.05,
            textAlign:'center',
            textAlignVertical:'center',
            transform: [
              {translate: [1,-1,0]},
              {rotateX: -75}
            ]
          }}>
          SPEED: {this.state.speedMultiplier}      
          </Text>
        </View>
        {/*View for + and - buttons, flexDirection is similar to "class = 'row'" in bootstrap*/}
          <View style={{
            flexDirection:'row',
            transform: [{translate: [0,0,1]}]
          }}>
            <VrButton>
              <Text style={{
                fontSize: 1 * this.state.showAll,
                // paddingTop: 0.025,
                // paddingBottom: 0.025,
                // paddingLeft: 0.05,
                // paddingRight: 0.15,
                textAlign:'center',
                textAlignVertical:'center',
                transform: [
                  {translate: [2,-1,0]},
                  {rotateX: -75}
                ]
              }}
              onEnter={()=>{this.decreaseSpeed()}}
              >
              -
              </Text>
            </VrButton>

            <VrButton>
              <Text style={{
                fontSize: 1 * this.state.showAll,
                // paddingTop: 0.025,
                // paddingBottom: 0.025,
                // paddingLeft: 0.05,
                // paddingRight: 0.15,
                textAlign:'center',
                textAlignVertical:'center',
                transform: [
                  {translate: [3,-1,0]},
                  {rotateX: -75}
                ]
              }}
              onEnter={()=>{this.increaseSpeed()}}
              >
              +
              </Text>
            </VrButton>

            <VrButton>
              <Text style={{
                fontSize: 1 * this.state.showAll,
                // paddingTop: 0.025,
                // paddingBottom: 0.025,
                // paddingLeft: 0.05,
                // paddingRight: 0.15,
                textAlign:'center',
                textAlignVertical:'center',
                transform: [
                  {translate: [-3,-1,0]},
                  {rotateX: -75}
                ]
              }}
              onEnter={()=>{this.decreaseLevel()}}
              >
              -
              </Text>
            </VrButton>

            <VrButton>
              <Text style={{
                fontSize: 1 * this.state.showAll,
                // paddingTop: 0.025,
                // paddingBottom: 0.025,
                // paddingLeft: 0.05,
                // paddingRight: 0.15,
                textAlign:'center',
                textAlignVertical:'center',
                transform: [
                  {translate: [-2,-1,0]},
                  {rotateX: -75}
                ]
              }}
              onEnter={()=>{this.increaseLevel()}}
              >
              +
              </Text>
            </VrButton>
          </View>
          {/*View for Time Game Toggle button*/}
          <View style={{
            flexDirection:'row',
            transform: [{translate: [-4,1.5,1.75]}]
          }}>
          <VrButton>
            <Text style={{
              fontSize: 0.4 * this.state.showAll,
              textAlign: 'center',
              textAlignVertical: 'center',
              transform: [
                {translate: [0,0,0]},
                {rotateY: 75}
              ]
            }}
            onEnter={()=>{this.changeGameType()}}
            >
            Time Game? 
            </Text>
            <Text style={{
              fontSize: 0.4 * this.state.showAll,
              textAlign: 'center',
              textAlignVertical: 'center',
              transform: [
                {translate: [0,0,0]},
                {rotateY: 75}
              ]
            }}
            >
            {(this.state.timeGame) ? 'Yup' : 'Nope'}
            </Text>
          </VrButton>  
          </View>
   
      </View>
    );
  }
};

AppRegistry.registerComponent('vrGame', () => vrGame);
