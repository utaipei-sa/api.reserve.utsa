<template>
<v-sheet rounded="rounded" color="grey-lighten-4"> 
  <v-container>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container  >
            <v-row>
              <v-col class="v-col-auto">
                <v-card title="基本資料" color="grey-lighten-1">
                </v-card>
              </v-col>
            </v-row>
            <v-row >
                <v-col class="v-col-sm-4 v-col-6">
                  <v-text-field :rules="[rules.required]" v-model="name" label="名字"/>
                </v-col>
                <v-col class="v-col-sm-4 v-col-6">
                  <v-text-field :rules="[rules.required]" v-model="org" label="申請單位"/>
                </v-col>
                <v-col class="v-col-sm-4 v-col-6">
                  <v-text-field :rules="[rules.required]" v-model="department" label="申請人系級"/>
                </v-col>
                <v-col class="v-col-12">
                  <v-text-field :rules="[rules.required]" v-model="email" label="email"/>
                </v-col>
                <v-col class="v-col-12">
                  <v-text-field :rules="[rules.required]" v-model="reason" label="借用理由" />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
    </v-row>
    
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container  >
            <v-row>
              <v-col class="v-col-auto">
                <v-card title="場地"  color="grey-lighten-1" ></v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="v-col-sm-4 v-col-12 ">
                <v-select label="場地"  :items="space_list[1]" v-model="space_temp"></v-select>
              </v-col>
              <v-col class="v-col-sm-4 v-col-12 ">
               <!-- <v-menu
                  v-model="menu1"
                  :close-on-content-click="false"
                  max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      :model-value="space_format_date"
                      clearable
                      label="Formatted with datefns"
                      v-bind="attrs"
                      v-on="on"
                      @click:clear="space_date_temp = null"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="space_date_temp"
                    @change="menu1 = false"
                  ></v-date-picker>
                </v-menu>
                -->
                <v-menu 
                  :close-on-content-click="false" 
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props }">
                    <v-text-field v-bind="props"   label="日期" v-model="space_format_date"></v-text-field>
                  </template>
                  <v-date-picker v-model="space_date_temp" locale="zh-TW"  ></v-date-picker> 
                </v-menu>
                <!--
                <v-menu
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="space_format_date"
                      label="Birthday date"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  
                  <v-date-picker
                    v-model="space_date_temp"
                    :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                    min="1950-01-01"
                  ></v-date-picker>
                </v-menu>
              -->
              </v-col>
              <v-col class="v-col-sm-4 v-col-12" >
                <v-select label="時間" :items="time_list"  v-model="space_time_temp"></v-select> <!-- multiple -->
              </v-col>
              <v-col class="v-col-sm-4 v-col-12">
                <v-btn @click="addspace()" >新增</v-btn>
              </v-col>
            </v-row>
            <v-row >
            <v-divider></v-divider>
            </v-row>
            <v-row v-for="(i,index) in space_data">
              <v-col class="v-col-auto">
                <v-card color="grey-lighten-3">
                  <v-container>
                    <v-row >
                      <!--
                      <v-col class="v-col-sm-1 v-col-12">
                        {{ index+1 }}
                      </v-col>-->
                      <v-col class="v-col-sm-3 v-col-12">
                        {{ i[0] }}
                      </v-col>
                      <v-col class="v-col-sm-4 v-col-12">
                        {{ i[1] }}
                      </v-col>
                      <v-col class="v-col-sm-3 v-col-12">
                        {{ i[2] }}
                      </v-col>
                      <v-col class="v-col-sm-2 v-col-12">
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
          
          <v-container >
            <v-row >
              <v-col class="v-col-auto">
                <v-card title="物品"  color="grey-lighten-1" ></v-card>
              </v-col>
            </v-row>
            <v-row >
              <v-col class="v-col-sm-3 v-col-12" >
                <v-select label="物品" :items="item_list[1]" v-model="item_temp"></v-select>
              </v-col>
              <v-col class="v-col-sm-3 v-col-12">
                <v-menu 
                  :close-on-content-click="false" 
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props }">
                    <v-text-field v-bind="props"   label="借用日期" v-model="item_format_date1"></v-text-field>
                  </template>
                  <v-date-picker v-model="item_date_temp1" locale="zh-TW"  ></v-date-picker> 
                </v-menu>
              </v-col>
              <v-col class="v-col-sm-3 v-col-12">
                
                <v-menu 
                  :close-on-content-click="false" 
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props }">
                    <v-text-field v-bind="props"   label="歸還日期" v-model="item_format_date2"></v-text-field>
                  </template>
                  <v-date-picker v-model="item_date_temp2" locale="zh-TW"  ></v-date-picker> 
                </v-menu>
              </v-col>
              <v-col  class="v-col-sm-3 v-col-12">
                <v-text-field label="數量" type="number"  v-model="item_quantity_temp"></v-text-field><!-- multiple -->
              </v-col>
              <v-col class="v-col-sm-2 v-col-12">
                <v-btn @click="additem()" >新增</v-btn>
              </v-col>
            </v-row>
            <v-row >
              
            </v-row>
            <v-row v-for="(i,index) in item_data">
              <v-col>
                <v-card color="grey-lighten-3">
                  <v-container>
                    <v-row >
                      <!--
                      <v-col class="v-col-sm-3 v-col-12">
                        {{ index+1 }} 
                      </v-col>-->
                      <v-col class="v-col-sm-2 v-col-12">
                        {{ i[0] }}
                      </v-col >
                      <v-col class="v-col-sm-3 v-col-12">
                        {{ i[1] }}
                      </v-col>
                      <v-col class="v-col-sm-3 v-col-12">
                        {{ i[2] }}
                      </v-col>
                      <v-col class="v-col-sm-2 v-col-12">
                        {{ i[3] }}
                      </v-col>
                      <v-col class="v-col-sm-2 v-col-12">
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
              <v-col class="v-col-auto">
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
              <v-card-text>
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
                          <v-row class="align-center">
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
                          <v-row class="align-center">
                            
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
  import { useDateFormat } from '@vueuse/core'
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
        space_date_temp:null,
        space_time_temp:"",
        space_temp:"",
        item_num:0,
        item_data:[],
        item_date_temp1:null,
        item_date_temp2:null,
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
        if(this.space_date_temp == null) return ""

        return useDateFormat(this.space_date_temp,'YYYY-MM-DD').value
      },
      item_format_date1(){
        if(this.item_date_temp1 == null) return ""

        return useDateFormat(this.item_date_temp1,'YYYY-MM-DD').value
      },
      item_format_date2(){
        if(this.item_date_temp2 == null) return ""

        return useDateFormat(this.item_date_temp2,'YYYY-MM-DD').value
        
      }
    },
    methods:{
      async post_api(){
        console.log(this.submit);
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
      async addspace(){
        await axios.get("") 
        if(this.space_temp!="" && this.space_date_temp!="" &&this.space_time_temp!=""){
          this.space_data.push([this.space_temp,this.space_date_temp.toString(),this.space_time_temp])

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
          this.item_data.push([this.item_temp,this.item_date_temp1.toString(),this.item_date_temp2.toString(),this.item_quantity_temp])
          console.log(this.item_data) 
        }
      },
      addReserve(){
        let date = new Date()
        let temp = useDateFormat(date,"YYYY-MM-DDTHH:mm:ss.SSS+08:00")
        //"2024-03-05T17:39:25.933+08:00"
        //"2024-03-02T21:59:43.000+08:00"
        //2023-10-10T14:02:34+0800
        this.submit=
          {
            "submit_datetime": temp.value,
            "organization": this.org, 
            "name": this.name,
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
          console.log("space")
          
          let date_format_temp1 = useDateFormat(this.space_data[i][1],"YYYY-MM-DDT").value
          console.log(date_format_temp1)
          date_format_temp1 += this.space_data[i][2].toString().split('-')[0]
          let date_format_temp2 = useDateFormat(this.space_data[i][1],"YYYY-MM-DDT").value
          date_format_temp2 += this.space_data[i][2].toString().split('-')[1]
          
          this.submit['space_reservations'].push(
            {
              "space_id": this.space_list[0][this.space_data[i][0]],
              "start_datetime": date_format_temp1,
              "end_datetime": date_format_temp2
            }
          )
        }
        for(var i=0;i<this.item_data.length;i++){
          console.log("item")
          let date_format_temp1 = useDateFormat(this.item_data[i][1],"YYYY-MM-DDTHH:mm").value
          let date_format_temp2 = useDateFormat(this.item_data[i][2],"YYYY-MM-DDTHH:mm").value
          this.submit['item_reservations'].push(
            {
              "item_id":this.item_list[0][this.item_data[i][0]],
              "start_datetime":date_format_temp1,
              "end_datetime": date_format_temp2,
              "quantity":this.item_data[i][3]
            }
          )
        }
      },
    }
  }
</script>
<style>

</style>
