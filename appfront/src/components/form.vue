<template>
<v-sheet rounded="rounded" color="grey-lighten-4"> 
  <v-container>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container id="form" >
            <v-row >
                <v-col id="name">
                  <v-text-field v-model="name" label="名子"/>
                </v-col>
                <v-col id="org">
                  <v-text-field v-model="org" label="申請單位"/>
                </v-col>
                <v-col id="department">
                  <v-text-field v-model="department" label="申請人系級"/>
                </v-col>
              </v-row>
              <v-row >
                <v-col id="email">
                  <v-text-field v-model="email" label="email"/>
                </v-col>
              </v-row>
              <v-row >
                <v-col>
                  <v-text-field v-model="reason" label="借用理由" />
                </v-col>
              </v-row>
              <!-- <v-row no-gutters>
                <v-col id="choose">
                  <v-combobox label="choose" :items="['item','space']" v-model="choose"></v-combobox>
                </v-col>
                <v-col id="item" v-if="choose=='item'" offset="1">
                  <v-combobox label="item" :items="item" v-model="objchoose" ></v-combobox>
                </v-col>
                <v-col id="space" v-if="choose=='space'" offset="1">
                  <v-combobox label="space" :items="space" v-model="objchoose"></v-combobox>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col id="datepicker">
                  <v-menu
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px" >
                    <template v-slot:activator="{ props,on}">
                      <v-text-field v-bind="props" v-on="on" v-model="myDate"></v-text-field>
                    </template>
                    <v-date-picker  no-title range scrollable   title="日期" value="yyyy/MM/dd" v-model="date"  ></v-date-picker>
                  </v-menu>
                  
                </v-col>
                <v-col id="timepicker" offset="1">
                  <v-combobox label="time" :items="time" multiple v-model="timechoose"></v-combobox>
                </v-col>
                
              </v-row> -->
            </v-container>
          </v-card>
        </v-col>
    </v-row>
    
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          
          <v-container id="form" >
            <v-row>
              <v-col id="space_title">
                <v-card title="場地" color="grey-lighten-1" ></v-card>
              </v-col>
            </v-row>
            <v-row v-for="i in space_num">
              <v-col>
                <v-card color="grey-lighten-3">
                  <v-container>
                    <v-row >
                      <v-col id="space" >
                        <v-combobox label="場地"  :items="space_list" v-model="space[i]"></v-combobox>
                      </v-col>
                      <v-col id="datepicker">
                        <v-menu
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="290px" >
                          <template v-slot:activator="{ props,on}">
                            <v-text-field v-bind="props" v-on="on" v-model="space_date[i]"></v-text-field>
                          </template>
                          <v-date-picker  no-title range scrollable  title="日期" value="yyyy/MM/dd" v-model="space_date[i]"  ></v-date-picker>
                        </v-menu>
                        
                      </v-col>
                      <v-col id="timepicker" >
                        <v-combobox label="time" :items="time_list"  v-model="space_time[i]"></v-combobox> <!-- multiple -->
                      </v-col>
                      <v-col align-self="center">
                        <v-btn @click="delspace(index)" a>刪除</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn @click="addspace()" >新增</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row >
      <v-col>
        <v-btn size="large" @click="addReserve()"> 新增</v-btn>
      </v-col>
    </v-row>
    <v-row >
      <v-col >
        <v-container>
          <v-row :id="'listcontent'+index"  v-for="(i,index) in submit" no-gutters>
            <v-col id="list" >
              <v-card id="limited-products" color="grey-lighten-2" :style=" 'border: 1px outline black;'">
                <v-container>
                  <v-row >
                    <v-col>{{index+1}}</v-col>
                    <v-col v-for="(j,key,index) in i">
                      {{i[key]}}
                    </v-col>
                    <!-- <v-col>
                      <v-btn @click="delReserve(index)" a>刪除</v-btn>
                    </v-col> -->
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <v-row >
      <v-col>
        <v-btn size="large" @click="api()">提交</v-btn>
      </v-col>
    </v-row>
  </v-container>
</v-sheet>
  
</template>

<script>

  export default{
    data(){
      return{
        item_list:['chair1','chair2','table1','table2'],
        space_list:['place1','place2'],
        time_list:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
        monthDisk:{
          'Jan':1,
          'Feb':2,
          'Mar':3,
          'Apr':4,
          'May':5,
          'Jun':6,
          'Jul':7,
          'Aug':8,
          'Sep':9,
          'Oct':10,
          'Nov':11,
          'Dec':12
        },
        space_num : 0,
        space_date:[],
        space:[],
        space_time:[],

        item_num:0,
        item_date:[],
        item:[],
        item_time:[],
        item_quality:[],
        submit:[],
        email:"",
        org:"",
        department:"",
        name:"",
        reason:"",
        
        
      }
    },
    computed:{
      spaceDate(){
        if (this.space_date === "")return "日期"
        const temp = this.date.toString().split(' ')//if no toString() => error ensure type is String
        let str = temp[3]+"/"+this.monthDisk[temp[1]]+"/"+temp[2];
        return str
      }
    },
    methods:{
      api(){

      },
      delspace(index){
        this.space_date.splice(index,1)
        this.space_time.splice(index,1)
        this.space_num--
        this.space.splice(index,1)
      },
      addReserve(){
        this.submit.push(
          {
            type:this.choose,
            obj:this.objchoose,
            name:this.name,
            email:this.email,
            org:this.org,
            department:this.department,
            date:this.myDate,
            time:this.timechoose,
            //持續時間
            reason:this.reason
            //備註
            
          }//brace      dict   
        )
      },
      addspace(){
        this.space_num++
        this.space_date.push("")
        this.space_time.push("")
        this.space.push("")
        console.log(this.space_num)
      }
    }
  }
</script>
<style>
#choose{
  flex: 0 0 45%;
  max-width: 45%
}
#name{
  flex: 0 0 auto;
  max-width: 33%
}
#item{
  flex: 0 0 45%;
  max-width: 45%
}
#email{
  flex: 0 0 66%;
  max-width: 66%
}
#space{
  flex: 0 0 30%;
  max-width: 45%
}
#datepicker{
  flex: 0 0 auto;
  max-width: 30%
}
#timepicker{
  flex: 0 0 auto;
  max-width: 25%
}

#space_title{
  flex: 0 0 auto;
  max-width: fit-content
}


</style>