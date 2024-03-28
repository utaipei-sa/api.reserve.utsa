<template>
  <v-sheet  >
		<v-container>
			<v-row class="justify-center">
				<v-col class="px-16">
					<v-card >
						<v-card-title>
							{{ title }}
						</v-card-title>
						<v-card-text>
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
		let text = ref("")
		let title = ref("")
		check_verify_id(props.verifyid)
		async function check_verify_id(verifyid) {
			console.log(verifyid)
			await axios.get('http://localhost:3000/api/v1/reserve/verify',{ params : {
				id : verifyid
			}
			}).then((response) => {
				console.log(response)
				if(response['data']['code'] == 87){
					text = "ㄚㄚㄚㄚ"
					title = "成功預約"
					console.log(text,title)
				}
			})

		}

</script>
