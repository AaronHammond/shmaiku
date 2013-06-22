Dict = new Meteor.Collection('dictionary');
Smatter = new Meteor.Collection('smatter');
Rounds = new Meteor.Collection('rounds');


if (Meteor.isClient) {

    Template.shmaiku.haiku = function () {
        //only the single active round is published
        return Rounds.findOne();
    }

    Template.wordsplat.smattering = function () {
        return Smatter.find().fetch();
    }

    Template.wordsplat.events = {
        'click span.span3' : function(target){
            var id = target.toElement.parentElement.id;
            //when the user clicks to vote on an elt, decrement the target of their previous vote (if any)
            if(Session.get("vote")){
                Smatter.update({_id: Session.get("vote")},
                {$inc: {votes: -1}});
            }
            Session.set("vote", id);
            console.log("incrementing " + id);
            Smatter.update({_id: id},
                {$inc: {votes: 1}});
        }
    }

    Template.clock.time = function () {
        round = Rounds.findOne();
        if(typeof round == "undefined")
            return;
        clock = round.clock;

        if (!clock || clock === 0)
            return;

        // format into M:SS
        var min = Math.floor(clock / 60);
        var sec = clock % 60;
        return min + ':' + (sec < 10 ? ('0' + sec) : sec);
    }
}

Meteor.startup(function () {
    if (Meteor.isClient) {

        Deps.autorun(function () {
            Meteor.subscribe('smatter');
            Meteor.subscribe('rounds');
        });
    }
});

