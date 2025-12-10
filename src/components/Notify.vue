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
import { ref } from 'vue';

export default {
    props: [],
    setup: () => {
        const is_visible = ref(false);
        const title = ref("Notification");
        const text = ref("Notification");

        return {
            is_visible,
            title,
            text
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
