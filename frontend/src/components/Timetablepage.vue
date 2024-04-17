<template>
  <v-sheet color="grey-lighten-4">
    <v-container>
      <v-row>
        <v-col>
          <v-card color="grey-lighten-2">
            <v-container>
              <v-row>
                <v-col >
                  <v-select label="種類" :items="type_list" v-model="type_temp"/>
                </v-col>
              </v-row>
              <v-row v-if="type_temp=='物品' || type_temp=='場地'"> 
                <v-col >
                  <v-select label="清單" v-if="type_temp=='物品'" :items="item_list[1]" v-model="item"></v-select>
                  <v-select label="清單" v-if="type_temp=='場地'" :items="space_list[1]" v-model="space"></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col >
                  <v-select label="日期範圍" :items="date_range_list" v-model="date_range_temp"/>
                </v-col>
              </v-row>
              <v-row>
                <v-col >
                  <v-menu 
                    v-model="menu_open"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px" >
                    <template v-slot:activator="{props}">
                      <v-text-field v-bind="props"   label="查詢日期" v-model="format_date"></v-text-field>
                    </template>
                    <v-date-picker  v-model="search_date" ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn @click="serach()">查詢</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-row >
        <v-col>
          <v-card color="grey-lighten-2" v-if="hasGetData">
            <v-container>
              <v-row>
                <v-col >
                  <v-card title="可用時間" :text="'日期:'+(search_date==null?'無':date_to_date)" color="grey-lighten-1"/>          
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card  color="grey-lighten-1" v-if="type=='場地'">
                    <v-container v-if="wh.width>=780 && date_range!='一天'">
                      <v-row>
                        <v-col class="v-col-2">
                         
                        </v-col>
                        <v-col v-for="(i,index) in available[0]">
                          {{ available[0][index]['start_datetime'] }}
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="v-col-2">
                          08:00~12:00
                        </v-col>
                        <v-col v-for="(i,index) in available[0]">
                          {{ available[0][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="v-col-2">
                          13:00~17:00
                        </v-col>
                        <v-col v-for="(i,index) in available[0]">
                          {{ available[1][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="v-col-2">
                          18:00~22:00
                        </v-col>
                        <v-col v-for="(i,index) in available[0]">
                          {{ available[2][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-container v-if="wh.width<780 && date_range!='一天'">
                      <v-row v-if="wh.width>=500">
                        <v-col class="v-col-2">
                        </v-col>
                        <v-col class="overflow-hidden text-center">
                          08:00~12:00
                        </v-col>
                        <v-col class="overflow-hidden text-center">
                          13:00~17:00
                        </v-col>
                        <v-col class="overflow-hidden text-center">
                          18:00~22:00
                        </v-col>
                      </v-row>
                      <v-row v-if="wh.width<500">
                        <v-col class="v-col-2">
                        </v-col>
                        <v-col class="overflow-hidden text-center pa-1">
                          <div>
                            08:00
                          </div>
                          <div>
                            ~12:00
                          </div>
                        </v-col>
                        <v-col class="overflow-hidden text-center pa-1">
                          <div>
                            13:00
                          </div>
                          <div>
                            ~17:00
                          </div>
                        </v-col>
                        <v-col class="overflow-hidden text-center pa-1">
                          <div>
                            18:00
                          </div>
                          <div>
                            ~22:00
                          </div>
                        </v-col>
                      </v-row>
                      <v-row v-for="(i,index) in available[0]" class="py-3" >
                        <v-col class="v-col-2 pa-0 align-center" v-if="wh.width<360">
                          <v-responsive aspect-ratio="1" class="slash">
                            <v-container class="h-100 justify-center align-center ma-0 pa-0 ">
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class=" v-col-6  text-center ma-0 pa-0">
                                {{ available[0][index]['mouth'] }}
                              </v-col>
                            </v-row>
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class="v-col-6 ma-0 pa-0"></v-col>
                              <v-col class="v-col-6 text-center ma-0 pa-0">
                                {{ available[0][index]['date'] }}
                              </v-col>  
                            </v-row>
                          </v-container>
                          </v-responsive>
                        </v-col>
                        <v-col class="v-col-2 pa-1 align-center" v-if="wh.width>=360 && wh.width<440"> 
                          <v-responsive aspect-ratio="1" class="slash">
                            <v-container class="h-100 justify-center align-center ma-0 pa-0 ">
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class=" v-col-6  text-center ma-0 pa-0">
                                {{ available[0][index]['mouth'] }}
                              </v-col>
                            </v-row>
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class="v-col-6 ma-0 pa-0"></v-col>
                              <v-col class="v-col-6 text-center ma-0 pa-0">
                                {{ available[0][index]['date'] }}
                              </v-col>  
                            </v-row>
                          </v-container>
                          </v-responsive>
                        </v-col>
                        <v-col class="v-col-2 pa-2 align-center" v-if=" wh.width>=440"> 
                          {{ available[0][index]['mouth'] }}/{{ available[0][index]['date'] }}
                          <!-- <v-responsive aspect-ratio="1" class="slash">
                            <v-container class="h-100 justify-center align-center ma-0 pa-0 ">
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class=" v-col-6  text-center ma-0 pa-0">
                                {{ available[0][index]['mouth'] }}
                              </v-col>
                            </v-row>
                            <v-row  class="h-50 ma-0 pa-0 align-center">
                              <v-col class="v-col-6 ma-0 pa-0"></v-col>
                              <v-col class="v-col-6 text-center ma-0 pa-0">
                                {{ available[0][index]['date'] }}
                              </v-col>  
                            </v-row>
                          </v-container>
                          </v-responsive> -->
                        </v-col>
                        <v-col class="pa-1 text-center ">
                          {{ available[0][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                        <v-col class="pa-1 text-center">
                          {{ available[1][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                        <v-col class="pa-1 text-center"> 
                          {{ available[2][index]['availability']==0?"可借":"不可借" }}
                        </v-col>
                      </v-row>
                    </v-container>
                    
                  </v-card>
                  <v-card  color="grey-lighten-1" v-if="type=='物品'">
                    <v-container v-if="wh.width>=780 && date_range!='一天'">
                      <v-row>
                        <v-col>
                          日期
                        </v-col>
                        <v-col v-for="(i,index) in available">
                          {{ available[index]['start_datetime'] }}
                        </v-col>
                      </v-row>
                      
                      <v-row>
                        <v-col>
                          個數
                        </v-col>
                        <v-col v-for="(i,index) in available">
                          {{ available[index]['availability'] }}
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-container v-if="wh.width<780 && date_range!='一天'">
                      <v-row>
                        <v-col>
                          日期
                        </v-col>
                        <v-col>
                          個數
                        </v-col>
                      </v-row>
                      <v-row v-for="(i,index) in available">
                        <v-col class="v-col">
                          {{ available[index]['start_datetime'] }}
                        </v-col>
                        <v-col>
                          {{ available[index]['availability']}}
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-table v-if="date_range=='一天'">
                      <thead > 
                        <tr >
                          <th>時段</th>
                          <th>可借用數量</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{ available[0]['start_datetime']}}</td>
                          <td>{{ available[0]['availability']}}</td>
                        </tr>
                      </tbody>
                    </v-table> 
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
  </template>
  <script>
    import axios from 'axios';
    import { useDateFormat } from '@vueuse/core'
    import { useWindowSize } from '@vueuse/core'
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
              console.log(this.space_list)
            })
        axios
          .get('http://localhost:3000/api/v1/reserve/items',
            ).then((response)=>{
              let temp = response['data']
              for(let i=0;i<temp['data'].length;i++){
                this.item_list[0][response['data']['data'][i]['name']['zh-tw']]= response['data']['data'][i]['_id']
                this.item_list[1].push(response['data']['data'][i]['name']['zh-tw'])
              }
  
            })
      },
  
      data(){
        return{
          menu_open : false,
          wh : useWindowSize(),
          type : "",
          type_temp:"",
          type_list : ["場地","物品"],
          item_list:[{},[]],
          space_list:[{},[]],
          time_list:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
          available :[],
          item:"",
          space:"",
          date_range_list:["一個禮拜"],
          date_range:"",
          date_range_temp:"",
          search_date:null,
          show_date:"",
          start_datetime:"",
          start_datetime_temp:"",
          end_datetime:"",
          end_datetime_temp:"",
          hasGetData:false,
        }
      },
      computed:{
        format_date(){
          if(this.search_date == null) return ""
          setTimeout(()=>{
            this.menu_open = false
          },120)
          
          let a = useDateFormat(this.search_date,"YYYY-MM-DDTHH:mm").value
          this.start_datetime = a
          let b = useDateFormat(this.search_date,"YYYY-MM-DD")
          return b.value
        },
        date_to_date(){
          if(this.search_date == null) return ""
          let sd = useDateFormat(this.start_datetime_temp,"YYYY-MM-DD")
          let ed = useDateFormat(this.end_datetime_temp,"YYYY-MM-DD")
          return sd.value + "~" + ed.value
        }
      },
      methods:{
        async serach(){
          console.log(this.show_date)
          console.log(this.item_list[0][this.item])
          console.log(this.start_datetime)
          console.log(this.end_datetime);
          console.log(this.wh.height)
          this.type = this.type_temp.slice()
          this.date_range = this.date_range_temp.slice()
          this.start_datetime_temp = this.start_datetime.slice()
          
          let date = new Date(this.start_datetime)
          if(this.date_range == "一個禮拜"){
            date.setDate(date.getDate()+7)
          }else{
            date.setDate(date.getDate()+1)
          }
          console.log(date)
          this.end_datetime = useDateFormat(date,"YYYY-MM-DDTHH:mm").value
          console.log(this.end_datetime)
          this.end_datetime_temp = this.end_datetime.slice()
          if(this.type == "場地"){
            this.available[0] = []
            this.available[1] = []
            this.available[2] = []
            await axios
            .get('http://localhost:3000/api/v1/reserve/interval_space_availability'
              ,{params:{
                space_id:this.space_list[0][this.space],
                start_datetime:this.start_datetime,
                end_datetime:this.end_datetime
              }},
            ).then((response)=>{
                console.log(response)
                for(let i=0;i<response['data'].length;i++){
                  this.available[i%3].push(response['data'][i])
                  this.available[i%3][this.available[i%3].length-1]['start_datetime'] = useDateFormat(this.available[i%3][this.available[i%3].length-1]['start_datetime'].substring(0,this.available[i%3][this.available[i%3].length-1]['start_datetime'].length-6),"MM-DD").value
                  this.available[i%3][this.available[i%3].length-1]['end_datetime'] = useDateFormat(this.available[i%3][this.available[i%3].length-1]['end_datetime'].substring(0,this.available[i%3][this.available[i%3].length-1]['end_datetime'].length-6),"MM-DD").value 
                  this.available[i%3][this.available[i%3].length-1]['date'] = useDateFormat(this.available[i%3][this.available[i%3].length-1]['start_datetime'],"DD").value
                  this.available[i%3][this.available[i%3].length-1]['mouth'] = useDateFormat(this.available[i%3][this.available[i%3].length-1]['start_datetime'],"MM").value
                }
                console.log(this.available)
              })
          }else{
            this.available = []
            await axios
            .get('http://localhost:3000/api/v1/reserve/interval_item_availability'
              ,{params:{
                item_id:this.item_list[0][this.item],
                start_datetime:this.start_datetime,
                end_datetime:this.end_datetime
              }},
            ).then((response)=>{
                console.log(response)
                this.available = response['data']
                for(let i=0;i<this.available.length;i++){
                  this.available[i]['start_datetime'] = useDateFormat(this.available[i]['start_datetime'].substring(0,this.available[i]['start_datetime'].length-6),"MM-DD").value
                  this.available[i]['end_datetime'] = useDateFormat(this.available[i]['end_datetime'].substring(0,this.available[i]['end_datetime'].length-6),"MM-DD").value 
                }
                console.log(this.available)
              })
          }
          this.hasGetData = true
        },
      
      }
    }
  </script>
  <style>
  .slash{
    line-height: 0.5rem;
    background:
      linear-gradient(135deg, transparent 48.5%, black 50%, black 50%, transparent 50.5%);
  }
  </style>