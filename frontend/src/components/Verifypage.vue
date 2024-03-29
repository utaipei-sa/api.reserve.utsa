<template>
  <v-sheet class="h-100 bg-grey-lighten-5" >
		<v-container class=" h-100">
			<v-row class="justify-center align-center h-100	">
				<v-col class="px-sm-16">
					<v-card  class="mx-16">
						<v-card-title :class="title_class">
							{{ title }}
						</v-card-title>
						<v-card-text :class="text_class">
							{{ text }}
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
  </v-sheet>
</template> 

<script setup>
	import axios from 'axios';
	import { ref } from 'vue';

	const props = defineProps(['verifyid'])
	const text = ref("default")
	const title = ref("default")
	const text_class = ref("bg-green pt-4")
	const title_class = ref("bg-green")
	check_verify_id(props.verifyid)
	async function check_verify_id(verifyid) {
		console.log(verifyid)
		await axios.get('http://localhost:3000/api/v1/reserve/verify',{ params : {
			id : verifyid
		}
		}).then((response) => {
			if(response['data']['code'] == 87){
				text.value = "ㄚㄚㄚㄚ"
				title.value = "成功預約"
				text_class.value = "bg-green-accent-1 pt-4"
				title_class.value = "bg-green-accent-3"
			}	
		}).catch((error)=>{
			if(error['response']['data']['code'] == 88){
				text.value = "ㄚㄚㄚㄚ"
				title.value = "查無此筆預約資料"
				text_class.value = "bg-red-lighten-4 pt-4"
				title_class.value = "bg-red-darken-2"
			}else if(error['response']['data']['code'] == 89){
				text.value = "ㄚㄚㄚㄚ"
				title.value = "此筆預約已驗證"
				text_class.value = "bg-red-lighten-4 pt-4"
				title_class.value = "bg-red-darken-2"
			}
		})

	}

</script>
