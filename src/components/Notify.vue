<template>
    <v-dialog v-model="is_visible" width="400">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>{{title}}</v-card-title>

            <v-card-text>{{text}}</v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="is_visible=false">Yes</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
module.exports = {
    props: [],
    data: function() {
        return {
            is_visible: false,
            title: "Notification",
            text: "Notification"
        };
    },
    created: function() {
        console.log("confirm modal created");
    },
    methods: {
        show: function(title, text, callback) {
            this.title = title;
            this.text = text;
            this.is_visible = true;
        }
    }
};
</script>

<style>
</style>
