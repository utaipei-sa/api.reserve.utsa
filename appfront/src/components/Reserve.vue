<template>
  <v-container id="form" >
    <v-row>
      <v-col>
        <v-combobox label="item" :items="item"></v-combobox>
      </v-col>
      <v-col>
        <v-combobox label="space" :items="space"></v-combobox>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-date-picker></v-date-picker>
      </v-col>
    </v-row>
    
  </v-container>
</template>

<script >
  export default{
    data(){
      return{
        item:['chair1','chair2','table1','table2'],
        space:['place1','place2'],

      }
    }
  }
</script>
<style>


  </style>