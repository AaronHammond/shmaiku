/**
 * Created with JetBrains WebStorm.
 * User: aaron
 * Date: 6/13/13
 * Time: 7:15 PM
 * To change this template use File | Settings | File Templates.
 */
var syllablesNeeded = 5;

Meteor.startup(function () {
    start_round();
    // send keepalives so the server can tell when we go away.
    //
    // XXX this is not a great idiom. meteor server does not yet have a
    // way to expose connection status to user code. Once it does, this
    // code can go away.
    Meteor.setInterval(function () {
        Rounds.update({active: true}, {$inc: {clock: -1}});
        var round = Rounds.findOne({active: true});
        if(round.clock == 0){
            Rounds.update({active: true}, {$set: {clock: 15}});
            //grab the word with the greatest number of votes, with ties being broken alphabetically
            var winningWord = Smatter.findOne({}, {
                sort: {votes: -1, word: 1}
            });

            if(winningWord.votes == 0){
                get_smattering(syllablesNeeded);
                return false;
            }

            // we're on the first line
            if (round.line1.syllables < 5) {
                var currText = round.line1.text;
                Rounds.update({_id: round._id},
                    {$set: {line1: {text: currText + ' ' + winningWord.word,
                        syllables: round.line1.syllables + winningWord.syllables}
                    }
                    }
                );
                //if this line is done
                var newSyllableCount = round.line1.syllables + winningWord.syllables;
                if (newSyllableCount == 5) {
                    syllablesNeeded = 7;
                }
                else {
                    syllablesNeeded = 5 - newSyllableCount;
                }
            }
            else if (round.line2.syllables < 7) {
                var currText = round.line2.text;
                Rounds.update({_id: round._id},
                    {$set: {line2: {text: currText + ' ' + winningWord.word,
                        syllables: round.line2.syllables + winningWord.syllables}
                    }
                    }
                );
                //if this line is done
                var newSyllableCount = round.line2.syllables + winningWord.syllables;
                if (newSyllableCount == 7) {
                    syllablesNeeded = 5;
                }
                else {
                    syllablesNeeded = 7 - newSyllableCount;
                }
            }
            else if (round.line3.syllables < 5) {
                var currText = round.line3.text;
                Rounds.update({_id: round._id},
                    {$set: {line3: {text: currText + ' ' + winningWord.word,
                        syllables: round.line3.syllables + winningWord.syllables}
                    }
                    }
                );
                //if this line is done
                var newSyllableCount = round.line3.syllables + winningWord.syllables;
                if (newSyllableCount == 5) {
                    syllablesNeeded = 0;
                }
                else {
                    syllablesNeeded = 5 - newSyllableCount;
                }
            }
            //we have completed the haiku
            if (syllablesNeeded == 0) {
                //let everyone bask in the glory of their creation
                Rounds.update({active: true}, {$set: {clock: 5}});
                Meteor._sleepForMs(5000);
                syllablesNeeded = 5;

                start_round();
            }

            get_smattering(syllablesNeeded);
        }
    }, 1000);
});
Meteor.publish("smatter", function () {
    return Smatter.find();
});

Meteor.publish("rounds", function () {
    return Rounds.find({active: true});
})

function get_smattering(syllablesNeeded) {
    Smatter.remove({});
    var possibleWords = Dict.find({syllables: {$lte: syllablesNeeded}}).fetch();

    for (var i = 0; i < 16; i++) {
        var ct = possibleWords.length;
        var place = Math.floor(Math.random() * ct);
        var word = possibleWords[place];
        possibleWords.splice(place, 1);
        word.votes = 0;
        Smatter.insert(word);
    }
    Smatter.insert({syllables: 1, word: "the", votes: 0});
    Smatter.insert({syllables: 1, word: "and", votes: 0});
    Smatter.insert({syllables: 1, word: "to", votes: 0});
    Smatter.insert({syllables: 1, word: "a", votes: 0});
    Smatter.insert({syllables: 1, word: "of", votes: 0});
    Smatter.insert({syllables: 1, word: "in", votes: 0});
    Smatter.insert({syllables: 1, word: "is", votes: 0});
    Smatter.insert({syllables: 1, word: "are", votes: 0});
}

function start_round() {
    //deactivate any active rounds
    Rounds.update({active: true}, {$set: {active: false}}, true);

    //insert a new round
    Rounds.insert({
        line1: {text: "", syllables: 0},
        line2: {text: "", syllables: 0},
        line3: {text: "", syllables: 0},
        active: true,
        clock: 15
    })

    get_smattering(5);
}