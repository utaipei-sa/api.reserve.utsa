<template>
<v-sheet color="grey-lighten-4">
  <v-container>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container>
            <v-row>
              <v-col >
                <v-select label="種類" :items="type_list" v-model="type"/>
              </v-col>
            </v-row>
            <v-row v-if="type=='物品' || type=='場地'"> 
              <v-col >
                <v-select label="清單" v-if="type=='物品'" :items="item_list[1]" v-model="item"></v-select>
                <v-select label="清單" v-if="type=='場地'" :items="space_list[1]" v-model="space"></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col >
                <v-menu 
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{props}">
                    <v-text-field v-bind="props"  label="查詢日期" v-model="format_date"></v-text-field>
                  </template>
                  <v-date-picker  v-model="search_date"></v-date-picker>
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
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container>
            <v-row>
              <v-col >
                <v-card title="可用時間" :text="'日期:'+(search_date==null?'無':show_date)" color="grey-lighten-1"/>          
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card color="grey-lighten-1">
                  <v-table>
                    <thead > 
                      <tr >
                        <th>時段</th>
                        <th>可借用</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(i,index) in time_list">
                        <td>{{ i }}</td>
                        <td>{{ available[index]?"可用":"不可用" }}</td>
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
  import { useDate } from 'vuetify'
  export default{
    mounted(){
      axios
        .get('http://localhost:3000/api/v1/reserve/spaces',
          ).then((response)=>{
            let temp = response['data']
            for(let i=0;i<temp['data'].length;i++){
              this.space_list[0][response['data']['data'][i]['name']['zh-tw']]=response['data']['data'][i]['id']
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
            }
            console.log(this.item_list);
          })
    },

    data(){
      return{
        formatter:useDate(),
        type : "",
        type_list : ["場地","物品"],
        item_list:[{},[]],
        space_list:[{},[]],
        time_list:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
        available :[true,true,true],
        item:"",
        space:"",
        search_date:null,
        show_date:"",
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
      }
    },
    computed:{
      format_date(){
        if(this.search_date == null) return ""
        console.log(this.search_date)
        this.show_date = this.formatter.format(this.search_date,'keyboardDate')
        return this.formatter.format(this.search_date,'keyboardDate')
      }
    },
    methods:{
      async serach(){
        await axios
        .get('http://localhost:3000/api/v1/reserve/spaces',
          ).then((response)=>{
            
            
            
          })
      }
    }
  }
</script>
<style>

</style>