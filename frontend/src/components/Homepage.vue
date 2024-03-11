<template>
<v-sheet rounded="rounded" color="grey-lighten-4">
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-img
          src=""
          >
          <!--pic for homepage-->
        </v-img>
        </v-card>
      </v-col>
    </v-row>   
    <v-row justify="center">      
      <v-col>
        <v-card color="transparent" elevation="0">
          <v-card-text>
            <!--以下為提醒事項-->
            <ul class="message">
                <li v-for="item in RemindMessage" :key="item">{{ item }}</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-card color="transparent" elevation="0">
          <v-card-text>
              <v-row align="center">
                <v-col>
                  <v-card title="聯絡我們" color="grey-lighten-1">
                    <v-card-text>
                      <v-row align="center">
                        <v-col>
                          <v-btn text href="https://www.instagram.com/utaipei_sa/">學生會IG</v-btn>
                        </v-col>
                        <v-col>
                          <v-btn text href="https://www.facebook.com/Utaipeisa2.0/?locale=zh_TW">學生會FB</v-btn>
                        </v-col>
                        <v-col>
                          <v-btn text href="mailto:utsa@go.utaipei.edu.tw​">學生會Email</v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
                
              </v-row>
            </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</v-sheet>
</template>

<script setup>
  const RemindMessage = [
  "預約領取時間：平日12:10~12:30",
  "天母資源請到課活組借用",
];
</script>

<style>
.message{
  font-size: 16px;
  
}
</style>