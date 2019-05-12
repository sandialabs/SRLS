<template>
    <v-dialog v-model="is_visible" width="400">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>{{title}}</v-card-title>

            <v-card-text>{{ text }}</v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="confirm()">Yes</v-btn>
                <v-btn class="red white--text" @click="is_visible=false">No</v-btn>
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
            title: "Confirm",
            text: "Confirm?"
        };
    },
    created: function() {
        console.log("confirm modal created");
        this.callback = null;
    },
    methods: {
        show: function(title, text, callback) {
            console.log("In confirm.show");
            this.title = title;
            this.text = text;
            this.is_visible = true;
            this.callback = callback;
        },
        confirm: function() {
            console.log("CONFIRMED");
            this.is_visible = false;
            this.callback();
        }
    }
};
</script>

<style>
</style>
