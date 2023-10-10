<template>
<v-sheet color="grey-lighten-4">
  <v-container>
    <v-row>
      <v-col>
        <v-card color="grey-lighten-2">
          <v-container>
            <v-row>
              <v-col id="type">
                <v-select label="種類" :items="type_list" v-model="type"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col id="list">
                <v-select label="清單" v-if="type=='物品'" :items="item_list[1]" v-model="item"></v-select>
                <v-select label="清單" v-if="type=='場地'" :items="space_list[1]" v-model="space"></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col id="item_datepicker_1">
                <v-menu 
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px" >
                  <template v-slot:activator="{ props,on}">
                    <v-text-field v-bind="props" v-on="on" label="查詢日期" v-model="format_date"></v-text-field>
                  </template>
                  <v-date-picker v-model="search_date"></v-date-picker>
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
              <v-col id="table_title">
                <v-card title="可用時間" :text="'日期:'+(search_date==''?'無':search_date)" color="grey-lighten-1"/>          
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card color="grey-lighten-1">
                  <v-table>
                    <thead align="center"> 
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
        type : "",
        type_list : ["場地","物品"],
        item_list:[{},[]],
        space_list:[{},[]],
        time_list:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
        available :[true,true,true],
        item:"",
        space:"",
        search_date:"",
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
        if(this.search_date === "")return""
        let temp = this.search_date.toString().split(" ")
        let formattd_date = temp[3]+"-"+this.monthDisk[temp[1]]+"-"+temp[2]
        this.search_date = formattd_date
        return formattd_date
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
#type{
  flex: 0 0 33%;
  max-width: 33%
}
#list{
  flex: 0 0 50%;
  max-width: 50%
}
#table_title{
  flex: 0 0 auto;
  max-width: fit-content
}
</style>