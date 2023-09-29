<template>
  <v-container id="form" >
    <v-row>
      <v-col id="choose">
        <v-combobox label="choose" :items="['item','space']" v-model="choose"></v-combobox>
      </v-col>
    </v-row>
    <v-row>
      <v-col id="item" v-if="choose=='item'">
        <v-combobox label="item" :items="item"></v-combobox>
      </v-col>
      <v-col id="space" v-if="choose=='space'">
        <v-combobox label="space" :items="space"></v-combobox>
      </v-col>
    </v-row>
    <v-row>
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
      <v-col id="timepicker">
        <v-combobox label="time" :items="time" multiple></v-combobox>
      </v-col>
      
    </v-row>
    <v-row>
      <v-col>
        <v-btn size="large" @click="addReserve()"> 新增</v-btn>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
  
  export default{
    data(){
      return{
        item:['chair1','chair2','table1','table2'],
        space:['place1','place2'],
        date:"",
        choose :"",
        time:['08:00-12:00', '13:00-17:00', '18:00-22:00'],
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
      myDate(){
        if (this.date === "")return "日期"
        const temp = this.date.toString().split(' ')//if no toString() => error ensure type is String
        let str = temp[3]+"/"+this.monthDisk[temp[1]]+"/"+temp[2];
        return str
      }
    },
    method:{
      addReserve(){

      }
    }
  }
</script>
<style>
#choose{
  flex: 0 0 50%;
  max-width: 30%
}
#item{
  flex: 0 0 50%;
  max-width: 30%
}
#space{
  flex: 0 0 50%;
  max-width: 30%
}
#datepicker{
  flex: 0 0 auto;
  max-width: 50%
}
#timepicker{
  flex: 0 0 auto;
  max-width: 50%
}
</style>