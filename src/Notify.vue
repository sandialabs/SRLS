<template>
    <v-dialog v-model="is_visible" width="400">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>{{ title }}</v-card-title>

            <v-card-text>{{ text }}</v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="is_visible = false">Ok</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Ref, ref } from 'vue';

export default {
    name: "Notify",
    props: [],
    setup: () => {
        let title: Ref<string> = ref("");
        let text: Ref<string> = ref("");
        let is_visible = ref(false);
        
        return {
            title,
            text,
            is_visible
        };
    },
    // data: function () {
    //     return {
    //         is_visible: false,
    //         title: "Notification",
    //         text: "Notification",
    //     };
    // },
    created: function () {
        console.log("confirm modal created");
    },
    methods: {
        show: function (title: string, text: string) {
            this.title = title;
            this.text = text;
            this.is_visible = true;
        },
    },
};
</script>

<style></style>
