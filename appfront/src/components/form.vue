<template>
<v-sheet rounded="rounded" color="grey-lighten-4"> 
  <v-container>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container id="form" >
            <v-row>
              <v-col id="form_title">
                <v-card title="基本資料" color="grey-lighten-1">

                </v-card>
              </v-col>
            </v-row>
            <v-row >
                <v-col id="name">
                  <v-text-field :rules="[rules.required]" v-model="name" label="名字"/>
                </v-col>
                <v-col id="org">
                  <v-text-field :rules="[rules.required]" v-model="org" label="申請單位"/>
                </v-col>
                <v-col id="department">
                  <v-text-field :rules="[rules.required]" v-model="department" label="申請人系級"/>
                </v-col>
              </v-row>
              <v-row >
                <v-col id="email">
                  <v-text-field :rules="[rules.required]" v-model="email" label="email"/>
                </v-col>
              </v-row>
              <v-row >
                <v-col>
                  <v-text-field :rules="[rules.required]" v-model="reason" label="借用理由" />
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
            <v-row >
              <v-col id="space_title">
                <v-card title="場地"  color="grey-lighten-1" ></v-card>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col id="space" >
                <v-select label="場地"  :items="space_list[1]" v-model="space_temp"></v-select>
              </v-col>
              <v-col id="datepicker">
                <v-menu 
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props}">
                    <v-text-field v-bind="props" label="日期" v-model="space_format_date"></v-text-field>
                  </template>
                  <v-date-picker v-model="space_date_temp"></v-date-picker> 
                </v-menu>
                
              </v-col>
              <v-col id="timepicker" >
                <v-select label="時間" :items="time_list"  v-model="space_time_temp"></v-select> <!-- multiple -->
              </v-col>
              <v-col>
                <v-btn @click="addspace()" >新增</v-btn>
              </v-col>
            </v-row>
            <v-row >
              
            </v-row>
            <v-row v-for="(i,index) in space_data">
              <v-col>
                <v-card color="grey-lighten-3">
                  <v-container>
                    <v-row align="center">
                      <v-col>
                        {{ index+1 }}
                      </v-col>
                      <v-col>
                        {{ i[0] }}
                      </v-col>
                      <v-col>
                        {{ i[1] }}
                      </v-col>
                      <v-col>
                        {{ i[2] }}
                      </v-col>
                      <v-col>
                        <v-btn @click="delspace(index)" a>刪除</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>  
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          
          <v-container id="form" >
            <v-row >
              <v-col id="item_title">
                <v-card title="物品"  color="grey-lighten-1" ></v-card>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col id="item" >
                <v-select label="物品" :items="item_list[1]" v-model="item_temp"></v-select>
              </v-col>
              <v-col id="item_datepicker_1">
                <v-menu 
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props}">
                    <v-text-field v-bind="props"  label="借用日期" v-model="item_format_date1"></v-text-field>
                  </template>
                  <v-date-picker v-model="item_date_temp1"></v-date-picker>
                </v-menu>
                
              </v-col>
              <v-col id="item_datepicker_2">
                <v-menu 
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props}">
                    <v-text-field v-bind="props"  label="歸還日期" v-model="item_format_date2"></v-text-field>
                  </template>
                  <v-date-picker  v-model="item_date_temp2"></v-date-picker>
                </v-menu>
                
              </v-col>
              <v-col  >
                <v-text-field label="數量" type="number"  v-model="item_quantity_temp"></v-text-field><!-- multiple -->
              </v-col>
              <v-col>
                <v-btn @click="additem()" >新增</v-btn>
              </v-col>
            </v-row>
            <v-row >
              
            </v-row>
            <v-row v-for="(i,index) in item_data">
              <v-col>
                <v-card color="grey-lighten-3">
                  <v-container>
                    <v-row align="center">
                      <v-col >
                        {{ index+1 }} 
                      </v-col>
                      <v-col>
                        {{ i[0] }}
                      </v-col>
                      <v-col>
                        {{ i[1] }}
                      </v-col>
                      <v-col>
                        {{ i[2] }}
                      </v-col>
                      <v-col>
                        {{ i[3] }}
                      </v-col>
                      <v-col>
                        <v-btn @click="delitem(index)" a>刪除</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>  
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <!-- <v-row >
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
                    <v-col>
                      <v-btn @click="delReserve(index)" a>刪除</v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container >
            <v-row>
              <v-col id="note_title">
                <v-card title="備註" color="grey-lighten-1"></v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card >
                  <v-textarea v-model="note" />
                </v-card>
                
              </v-col>
            </v-row>
          </v-container>
        </v-card>
        
      </v-col>
    </v-row>
    <v-row >
      <v-col>
        <v-dialog width="60%" scrollable>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click="addReserve()" text="繼續"> </v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card title="Dialog">
              <v-card-text style="height: ;">
                <v-divider></v-divider>
                <v-container>
                  <v-row>
                    <v-col>名字:{{ name }}</v-col>
                    <v-col>單位:{{ org }}</v-col>
                    <v-col>系級:{{ department }}</v-col>
                  </v-row>
                  <v-row>
                    <v-col>email:{{ email }}</v-col>
                  </v-row>
                  <v-row>
                    <v-col>理由:{{ reason }}</v-col>
                  </v-row>
                  <v-row>
                    <v-col>備註:{{ note }}</v-col>
                  </v-row>
                  <v-row v-for="(i,index) in item_data">
                    <v-col>
                      <v-card color="grey-lighten-3">
                        <v-container>
                          <v-row align="center">
                            <v-col>
                              {{ i[0] }}
                            </v-col>
                            <v-col>
                              {{ i[1] }}
                            </v-col>
                            <v-col>
                              {{ i[2] }}
                            </v-col>
                            <v-col>
                              {{ i[3] }}
                            </v-col>
                          </v-row>
                        </v-container>  
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row v-for="i in space_data">
                    <v-col>
                      <v-card color="grey-lighten-3">
                        <v-container>
                          <v-row align="center">
                            
                            <v-col>
                              {{ i[0] }}
                            </v-col>
                            <v-col>
                              {{ i[1] }}
                            </v-col>
                            <v-col>
                              {{ i[2] }}
                            </v-col>
                          </v-row>
                        </v-container>  
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                
                <v-btn
                  text="取消"
                  variant="outlined"
                  @click="isActive.value = false"
                ></v-btn>
                <v-btn
                  text="確認"
                  variant="tonal"
                  @click="isActive.value = false,post_api()"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</v-sheet>
  
</template>

<script >
  import axios from 'axios';
  export default{
    mounted(){
      axios
        .get('http://localhost:3000/api/v1/reserve/spaces',
          ).then((response)=>{
            let temp = response['data']
            for(let i=0;i<temp['data'].length;i++){
              this.space_list[0][response['data']['data'][i]['name']['zh-tw']]=response['data']['data'][i]['_id']
              this.space_list[1].push(response['data']['data'][i]['name']['zh-tw'])
            }
            
          })
      axios
        .get('http://localhost:3000/api/v1/reserve/items',
          ).then((response)=>{
            let temp = response['data']
            for(let i=0;i<temp['data'].length;i++){
              this.item_list[0][response['data']['data'][i]['name']['zh-tw']]= response['data']['data'][i]['_id']
              this.item_list[1].push(response['data']['data'][i]['name']['zh-tw'])
              let key = response['data']['data'][i]['name']['zh-tw']
              let value = response['data']['data'][i]['quantity']
              this.quantity_limit_list[key]=value 
            }
            console.log(this.item_list);
          })
    },  
    data(){
      return{
        rules: {
          required: value => !!value || 'Field is required',
        },
        item_list:[{},[]],
        space_list:[{},[]],
        time_list:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
        quantity_limit_list:{},
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
        space_data :[],
        space_date_temp:"",
        space_time_temp:"",
        space_temp:"",
        item_num:0,
        item_data:[],
        item_date_temp1:"",
        item_date_temp2:"",
        item_quantity_temp:"",
        item_temp:"",
        
        submit:null,
        note:"",
        email:"",
        org:"",
        department:"",
        name:"",
        reason:"",
        
        
      }
    },
    computed:{
      space_format_date(){
        if(this.space_date_temp === "")return""
        let temp = this.space_date_temp.toString().split(" ")
        let formattd_date = temp[3]+"-"+this.monthDisk[temp[1]]+"-"+temp[2]
        this.space_date_temp = formattd_date
        return formattd_date
      },
      item_format_date1(){
        if(this.item_date_temp1 === "")return""
        let temp = this.item_date_temp1.toString().split(" ")
        let formattd_date = temp[3]+"-"+this.monthDisk[temp[1]]+"-"+temp[2]
        this.item_date_temp1 = formattd_date

        return formattd_date
      },
      item_format_date2(){
        if(this.item_date_temp2 === "")return""
        let temp = this.item_date_temp2.toString().split(" ")
        let formattd_date = temp[3]+"-"+this.monthDisk[temp[1]]+"-"+temp[2]
        this.item_date_temp2 = formattd_date

        return formattd_date
      }
    },
    methods:{
      async post_api(){
        await axios.post("http://localhost:3000/api/v1/reserve/reservation"
          ,this.submit
        ).then(function(response){
          console.log(response)
        }).catch(function(error){ 
          console.log(error)
        })
      },
      
      delspace(index){
        this.space_data.splice(index,1)
      },
      addspace(){
      
        if(this.space_temp!="" && this.space_date_temp!="" &&this.space_time_temp!=""){
          console.log(this.space_data) 
          
          this.space_data.push([this.space_temp,this.space_date_temp,this.space_time_temp])
  
        }
      },
      delitem(index){
        this.item_data.splice(index,1)
      },
      additem(){
        let date1 = new Date(this.item_date_temp1)
        let date2 = new Date(this.item_date_temp2)
        if(date1.getTime() > date2.getTime()){
          alert("date error")
        }
        else if (this.quantity_limit_list[this.item_temp]<this.item_quantity_temp || this.item_quantity_temp<=0){
          alert("over quantity(Max :"+this.quantity_limit_list[this.item_temp]+")")
        }
        else if(this.item_temp!="" && this.item_date_temp1!="" && this.item_date_temp2!="" && this.item_quantity_temp!=""){
          
          
          this.item_data.push([this.item_temp,this.item_date_temp1,this.item_date_temp2,this.item_quantity_temp])
          console.log(this.item_data) 
        }
      },
      addReserve(){
        let date = new Date()
        let temp = date.toString().split(' ')
        
        //2023-10-10T14:02:34+0800
        this.submit=
          {
            "submit_time": temp[3]+"-"+this.monthDisk[temp[1]]+"-"+temp[2]+"T"+temp[4]+temp[5].substring(3,temp[5].length),
            "organization": this.org, 
            "contact": this.name,
            "department_grade":this.department,
            "email": this.email,
            "reason" :this.reason,
            "space_reservations": [],
              /* {
                "space_id": "652038af1b2271aa002c0a0b",
                "start_time": "2023-10-17T08:00:00+08:00",
                "duration": "04:00"
              } */
            "item_reservations": [],
            "note": this.note
            
          }  
        for(var i=0;i<this.space_data.length;i++){
          console.log(this.space_list);
          this.submit['space_reservations'].push(
            {
              "space_id":this.space_list[0][this.space_data[i][0]],
              "start_time":this.space_data[i][1]+"T"+this.space_data[i][2].toString().split('-')[0]+":00+0800",
              "duration": "04:00"
            }
          )
          this.submit['item_reservations'].push(
            {
              "space_id":this.item_list[0][this.item_data[i][0]],
              "start_time":this.item_data[i][1],
              "end_date": this.item_data[i][2],
              "quantity":this.item_data[i][3]
            
            }
          )
        }
        console.log(this.submit);
        
      },
      
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
  flex: 0 0 auto;
  max-width: 30%
}
#item{
  flex: 0 0 auto;
  max-width: 30%
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
#item_title{
  flex: 0 0 auto;
  max-width: fit-content
}
#note_title{
  flex: 0 0 auto;
  max-width: fit-content
}
#form_title{
  flex: 0 0 auto;
  max-width: fit-content
}
</style>
