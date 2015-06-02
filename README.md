# Memorization-App

This is an app written completely in javascript and html that helps aid in memorization -- think index cards for the 21st century. This was originally created to help memorize Bible verses, but it can be used for any sort of memorization. 

## Running the app

Simply double-click on index.html, and bam! you're all set!

## Customize cards

In the cards/ directory, you'll notice that there's already a json (.js) file. You can use that as your template.

Here's the general breakdown of what a typical json file should look like:

``` json
	var memory = {
		groups: [
			{group: <groupname>, cards: [
				{card: <cardname>, content: <content>},
				...more cards...,
				{card: <cardname>, content: <content>}
			]},
			
			...more groups...,
			
			{group: <groupname>, cards: [ ... ]}
		]
	}
```

Notice that the last card and last group does NOT have a comma at the end -- if there is a comma, it would cause certain browsers (like IE) to not render correctly.

## Default checked boxes

You can have certain groups "checked" by default, by adding the checked paramter to a group:

``` json
	{group: <groupname>, checked: true, cards: [ ... ]}
```

## Modifying index.html 

Assuming you've created a new json file (let's call it file.js), you'll need to modify one line in index.html. Near the top of the file, you'll notice the comment `INSERT MEMORY SOURCE HERE`. Replace the following js file with file.js, and you're done!
